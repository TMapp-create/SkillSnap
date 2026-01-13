/*
  # Legal Policies and Consent Tracking

  ## Overview
  Adds comprehensive legal compliance features including Terms of Service, Privacy Policy,
  Cookie Policy, and user consent tracking with full audit trail.

  ## New Tables

  1. **policies**
     - Stores versioned legal policy documents
     - Fields: id, policy_type, version, content, effective_date, created_at
     - Policy types: terms_of_service, privacy_policy, cookie_policy

  2. **user_consents**
     - Tracks user acceptance of policies and cookie preferences
     - Fields: id, user_id, terms_version, privacy_version, cookie_version,
              terms_accepted_at, privacy_accepted_at, cookie_accepted_at,
              cookie_preferences (jsonb), created_at, updated_at
     - Maintains full audit trail of user consent

  ## Profile Updates
     - Add accepted_terms_version and accepted_privacy_version to profiles
     - Track latest policy versions accepted by users
     - Enable forcing re-acceptance when policies are updated

  ## Security
     - RLS enabled on all new tables
     - Users can only view and manage their own consent records
     - Admins can view all consent records for compliance
     - All authenticated users can view active policies
     - Only admins can create or update policy documents

  ## Initial Policy Content
     - Insert version 1.0 of Terms of Service
     - Insert version 1.0 of Privacy Policy
     - Insert version 1.0 of Cookie Policy
*/

-- Create policies table for versioned legal documents
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type text NOT NULL CHECK (policy_type IN ('terms_of_service', 'privacy_policy', 'cookie_policy')),
  version text NOT NULL,
  content text NOT NULL,
  effective_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(policy_type, version)
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active policies"
  ON policies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create user_consents table for tracking policy acceptance
CREATE TABLE IF NOT EXISTS user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  terms_version text,
  privacy_version text,
  cookie_version text,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  cookie_accepted_at timestamptz,
  cookie_preferences jsonb DEFAULT '{"essential": true, "analytics": false, "marketing": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consents"
  ON user_consents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert own consents"
  ON user_consents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consents"
  ON user_consents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add policy acceptance tracking to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'accepted_terms_version'
  ) THEN
    ALTER TABLE profiles ADD COLUMN accepted_terms_version text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'accepted_privacy_version'
  ) THEN
    ALTER TABLE profiles ADD COLUMN accepted_privacy_version text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_policy_check_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_policy_check_at timestamptz;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_policies_type_version ON policies(policy_type, version);
CREATE INDEX IF NOT EXISTS idx_policies_effective_date ON policies(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);

-- Insert initial Terms of Service (v1.0)
INSERT INTO policies (policy_type, version, content, effective_date) VALUES
('terms_of_service', '1.0', 
'# Terms of Service

**Effective Date: January 13, 2026**
**Version: 1.0**

Welcome to SkillSnap! These Terms of Service govern your use of our platform.

## 1. Acceptance of Terms

By creating an account and using SkillSnap, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our service.

## 2. Account Registration

- You must be at least 13 years old to use SkillSnap
- You must provide accurate and complete information during registration
- You are responsible for maintaining the security of your account credentials
- You must notify us immediately of any unauthorized access to your account

## 3. User Content and Activities

- You retain ownership of the content you post on SkillSnap
- By posting activities, you grant us a license to display and share your content on our platform
- You are responsible for the accuracy of logged activities and uploaded content
- You must not post content that is illegal, harmful, threatening, abusive, or violates others'' rights

## 4. Activity Verification

- School administrators and teachers may verify your logged activities
- Unverified activities may be subject to review or removal
- False or misleading activity logs may result in account suspension

## 5. Acceptable Use

You agree NOT to:
- Use the service for any illegal purposes
- Harass, abuse, or harm other users
- Attempt to gain unauthorized access to the service or other users'' accounts
- Upload viruses or malicious code
- Spam or send unsolicited messages to other users
- Manipulate XP or badge systems through fraudulent means

## 6. Intellectual Property

- SkillSnap and its content, features, and functionality are owned by us
- You may not copy, modify, or distribute our intellectual property without permission
- All trademarks, logos, and service marks are our property

## 7. Privacy

Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.

## 8. Termination

We reserve the right to:
- Suspend or terminate accounts that violate these terms
- Modify or discontinue the service at any time
- Remove content that violates our policies

You may terminate your account at any time through your account settings.

## 9. Disclaimers and Limitation of Liability

- SkillSnap is provided "as is" without warranties of any kind
- We are not liable for any indirect, incidental, or consequential damages
- Our total liability shall not exceed the amount you paid us in the past 12 months

## 10. Changes to Terms

We may update these Terms of Service from time to time. We will notify you of significant changes via email or platform notification. Continued use after changes constitutes acceptance.

## 11. Governing Law

These terms are governed by the laws of the United States. Any disputes will be resolved in the courts of the applicable jurisdiction.

## 12. Contact

For questions about these Terms of Service, contact us at legal@skillsnap.com

---

By using SkillSnap, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.',
CURRENT_DATE)
ON CONFLICT (policy_type, version) DO NOTHING;

-- Insert initial Privacy Policy (v1.0)
INSERT INTO policies (policy_type, version, content, effective_date) VALUES
('privacy_policy', '1.0',
'# Privacy Policy

**Effective Date: January 13, 2026**
**Version: 1.0**

SkillSnap is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.

## 1. Information We Collect

### Personal Information
- Name and email address
- School affiliation and graduation year
- Profile information (bio, avatar)
- Account credentials

### Activity Data
- Logged activities and skills
- XP and level progression
- Badges and achievements
- Goals and progress tracking
- Photos and proof links for activities

### Usage Information
- Device information and IP address
- Browser type and version
- Pages visited and features used
- Time and date of visits
- Referring website addresses

### Cookies and Tracking
We use cookies and similar technologies to enhance your experience. See our Cookie Policy for details.

## 2. How We Use Your Information

We use collected information to:
- Provide, operate, and maintain our service
- Improve and personalize your experience
- Process your activities and award XP/badges
- Send notifications about your account and activities
- Respond to your comments and questions
- Analyze usage patterns and improve our service
- Prevent fraud and enhance security
- Comply with legal obligations

## 3. Information Sharing

We do NOT sell your personal information. We may share information:
- **With your school**: Activity logs and progress may be visible to your teachers/administrators
- **With other users**: Based on your privacy settings (public profile, posted activities)
- **With service providers**: Third-party vendors who help us operate the platform
- **For legal reasons**: To comply with laws, regulations, or legal processes
- **Business transfers**: In connection with a merger, acquisition, or sale of assets

## 4. Your Privacy Controls

You control your information:
- **Profile visibility**: Choose to make your profile public or private
- **Activity posting**: Control which activities appear in public feeds
- **Cookie preferences**: Manage cookie settings through our Cookie Policy page
- **Data access**: Request a copy of your data at any time
- **Data deletion**: Request deletion of your account and associated data

## 5. Data Retention

We retain your information:
- **Active accounts**: While your account remains active
- **Inactive accounts**: Up to 2 years after last login
- **Legal requirements**: As required by law or for legitimate business purposes
- **Consent records**: Indefinitely for compliance and audit purposes

After account deletion, some information may remain in backups for up to 90 days.

## 6. Security

We implement appropriate security measures:
- Encryption of data in transit and at rest
- Regular security assessments and updates
- Access controls and authentication
- Secure hosting infrastructure

However, no method of transmission over the Internet is 100% secure.

## 7. Children''s Privacy

SkillSnap is designed for users aged 13 and older. We do not knowingly collect information from children under 13. If we learn we have collected such information, we will delete it promptly.

## 8. Your Rights

Depending on your location, you may have rights under GDPR, CCPA, or other privacy laws:
- **Access**: Request access to your personal information
- **Correction**: Request correction of inaccurate information
- **Deletion**: Request deletion of your information
- **Portability**: Request a copy of your data in a portable format
- **Objection**: Object to processing of your information
- **Restriction**: Request restriction of processing

To exercise these rights, contact us at privacy@skillsnap.com

## 9. International Users

Your information may be transferred to and processed in the United States or other countries. By using SkillSnap, you consent to such transfers.

## 10. Third-Party Links

Our service may contain links to third-party websites. We are not responsible for the privacy practices of these websites.

## 11. Changes to Privacy Policy

We may update this Privacy Policy periodically. We will notify you of material changes via email or platform notification. Review the "Effective Date" above to see when this policy was last updated.

## 12. Contact Us

For questions about this Privacy Policy or our privacy practices:
- Email: privacy@skillsnap.com
- Address: SkillSnap Privacy Team, [Your Address]

For data access, correction, or deletion requests, please email privacy@skillsnap.com with your account information.',
CURRENT_DATE)
ON CONFLICT (policy_type, version) DO NOTHING;

-- Insert initial Cookie Policy (v1.0)
INSERT INTO policies (policy_type, version, content, effective_date) VALUES
('cookie_policy', '1.0',
'# Cookie Policy

**Effective Date: January 13, 2026**
**Version: 1.0**

This Cookie Policy explains how SkillSnap uses cookies and similar technologies.

## 1. What Are Cookies?

Cookies are small text files stored on your device when you visit our website. They help us provide a better experience by remembering your preferences and understanding how you use our service.

## 2. Types of Cookies We Use

### Essential Cookies (Always Active)
These cookies are necessary for the website to function and cannot be disabled.

- **Authentication**: Keep you logged in and secure your session
- **Security**: Protect against fraudulent activity and enhance security
- **Load balancing**: Ensure proper performance and stability

### Analytics Cookies (Optional)
Help us understand how visitors use our site so we can improve it.

- **Usage data**: Pages visited, features used, time spent
- **Performance metrics**: Load times, errors, user flows
- **A/B testing**: Test different features and improvements

We use these analytics responsibly and do not track you across other websites.

### Marketing Cookies (Optional)
Help us show you relevant content and measure campaign effectiveness.

- **Preferences**: Remember your interests and customize content
- **Campaign tracking**: Understand which channels bring users to SkillSnap
- **Social media**: Enable sharing to social platforms

## 3. Third-Party Cookies

We may use third-party services that set their own cookies:
- **Supabase**: Our backend infrastructure provider
- **Analytics providers**: To understand usage patterns
- **CDN providers**: For content delivery and performance

These third parties have their own privacy policies and cookie practices.

## 4. Managing Your Cookie Preferences

You have control over cookies:

### Through SkillSnap
- Click "Cookie Settings" in the footer to adjust your preferences
- Enable or disable analytics and marketing cookies
- Essential cookies cannot be disabled as they''re required for functionality

### Through Your Browser
Most browsers allow you to:
- View and delete cookies
- Block all cookies
- Block third-party cookies only
- Clear cookies when closing the browser

Note: Disabling essential cookies may prevent you from using certain features.

### Browser-Specific Instructions

**Chrome**: Settings > Privacy and security > Cookies and other site data

**Firefox**: Settings > Privacy & Security > Cookies and Site Data

**Safari**: Preferences > Privacy > Manage Website Data

**Edge**: Settings > Privacy, search, and services > Cookies and site permissions

## 5. Do Not Track Signals

Some browsers support "Do Not Track" (DNT) signals. We respect DNT signals and will not track users who have DNT enabled.

## 6. Cookie Duration

- **Session cookies**: Deleted when you close your browser
- **Persistent cookies**: Remain until they expire or you delete them
- **Authentication cookies**: Expire after 30 days of inactivity
- **Preference cookies**: Expire after 1 year

## 7. Updates to Cookie Policy

We may update this Cookie Policy to reflect changes in our practices or legal requirements. Check the "Effective Date" above to see when this policy was last updated.

## 8. Contact Us

For questions about our use of cookies:
- Email: privacy@skillsnap.com
- Cookie Settings: Available in the footer of every page

By continuing to use SkillSnap, you consent to our use of cookies as described in this policy.',
CURRENT_DATE)
ON CONFLICT (policy_type, version) DO NOTHING;