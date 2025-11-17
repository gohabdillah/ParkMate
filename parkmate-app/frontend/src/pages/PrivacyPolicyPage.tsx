import { Box, Typography, Paper, Container, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: 2
      }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ color: 'white', mr: 1 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          Privacy Policy
        </Typography>
      </Box>

      {/* Content */}
      <Container maxWidth="md" sx={{ py: 3, flex: 1 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Last updated: November 14, 2025
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            ParkMate ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our mobile 
            application (the "App"). Please read this privacy policy carefully. If you do not agree with 
            the terms of this privacy policy, please do not access the App.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            2. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We may collect information about you in a variety of ways. The information we may collect via 
            the App includes:
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            2.1 Personal Data
          </Typography>
          <Typography variant="body1" paragraph>
            When you register for an account, we may collect personally identifiable information, such as:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              Email address
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Name
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Password (encrypted)
            </Typography>
          </Box>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            2.2 Location Data
          </Typography>
          <Typography variant="body1" paragraph>
            With your permission, we may access and track location-based information from your mobile device 
            to provide location-based services, such as finding nearby carparks. You can enable or disable 
            location services through your device settings at any time.
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            2.3 Usage Data
          </Typography>
          <Typography variant="body1" paragraph>
            We may collect information about your interactions with the App, including:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              Search history and preferences
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Favorite carparks
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Parking history
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              App usage statistics
            </Typography>
          </Box>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            2.4 Device Information
          </Typography>
          <Typography variant="body1" paragraph>
            We may collect information about your mobile device, including:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              Device type and model
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Operating system version
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Unique device identifiers
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Mobile network information
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            3. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              Create and manage your account
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Provide, operate, and maintain the App
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Display nearby carparks based on your location
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Save your favorite carparks and parking history
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Improve and personalize your experience
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Respond to your comments, questions, and provide customer service
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Send you notifications (if enabled)
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Monitor and analyze usage and trends to improve the App
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Detect, prevent, and address technical issues
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            4. Disclosure of Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We may share information we have collected about you in certain situations:
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            4.1 Third-Party Service Providers
          </Typography>
          <Typography variant="body1" paragraph>
            We may share your information with third-party service providers that perform services for us, 
            including:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              Google Maps API for map and location services
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Cloud hosting providers for data storage
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Analytics providers to help us improve the App
            </Typography>
          </Box>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            4.2 Legal Requirements
          </Typography>
          <Typography variant="body1" paragraph>
            We may disclose your information if required to do so by law or in response to valid requests 
            by public authorities (e.g., a court or government agency).
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            4.3 Business Transfers
          </Typography>
          <Typography variant="body1" paragraph>
            If we are involved in a merger, acquisition, or asset sale, your information may be transferred. 
            We will provide notice before your information is transferred and becomes subject to a different 
            privacy policy.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            5. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We use administrative, technical, and physical security measures to protect your personal 
            information. While we have taken reasonable steps to secure the information you provide to us, 
            please be aware that no security measures are perfect or impenetrable, and no method of data 
            transmission can be guaranteed against any interception or other type of misuse.
          </Typography>
          <Typography variant="body1" paragraph>
            We implement the following security measures:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              Password encryption using industry-standard algorithms
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Secure HTTPS connections for data transmission
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Regular security audits and updates
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Access controls to limit who can access your data
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            6. Data Retention
          </Typography>
          <Typography variant="body1" paragraph>
            We will retain your information for as long as your account is active or as needed to provide 
            you services. If you wish to delete your account, you can do so through the Settings page. 
            When you delete your account, all your personal information, favorites, and history will be 
            permanently deleted from our servers.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            7. Your Privacy Rights
          </Typography>
          <Typography variant="body1" paragraph>
            Depending on your location, you may have certain rights regarding your personal information:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              <strong>Access:</strong> You can request a copy of your personal information
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Correction:</strong> You can update or correct your information through your account settings
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Deletion:</strong> You can delete your account and all associated data
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Opt-out:</strong> You can disable notifications and location services at any time
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            8. Location Services
          </Typography>
          <Typography variant="body1" paragraph>
            The App uses location services to provide you with nearby carpark information. You can control 
            location permissions through your device settings. Disabling location services may limit certain 
            features of the App, such as finding carparks near you.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            9. Third-Party Websites and Services
          </Typography>
          <Typography variant="body1" paragraph>
            The App may contain links to third-party websites and services (such as Google Maps). We are 
            not responsible for the privacy practices of these third parties. We encourage you to read the 
            privacy policies of every website you visit.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            10. Children's Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            The App is not intended for children under 13 years of age. We do not knowingly collect personal 
            information from children under 13. If you are a parent or guardian and believe your child has 
            provided us with personal information, please contact us, and we will delete such information.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            11. Changes to This Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last updated" date. You are advised to 
            review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are 
            effective when they are posted on this page.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            12. International Data Transfers
          </Typography>
          <Typography variant="body1" paragraph>
            Your information may be transferred to and maintained on servers located outside of Singapore. 
            By using the App, you consent to the transfer of your information to countries that may have 
            different data protection laws than Singapore.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            13. California Privacy Rights
          </Typography>
          <Typography variant="body1" paragraph>
            If you are a California resident, you have specific rights regarding access to your personal 
            information under the California Consumer Privacy Act (CCPA). You have the right to request 
            information about the categories of personal data we collect, the purposes for which we use it, 
            and the categories of third parties with whom we share it.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            14. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions or concerns about this Privacy Policy or our data practices, please 
            contact us at:
          </Typography>
          <Box sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body1" paragraph>
              Email: privacy@parkmate.sg
            </Typography>
            <Typography variant="body1" paragraph>
              Address: Singapore
            </Typography>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              By using ParkMate, you acknowledge that you have read and understood this Privacy Policy.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage;
