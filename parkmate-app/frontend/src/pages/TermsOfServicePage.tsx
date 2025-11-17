import { Box, Typography, Paper, Container, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TermsOfServicePage = () => {
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
          Terms of Service
        </Typography>
      </Box>

      {/* Content */}
      <Container maxWidth="md" sx={{ py: 3, flex: 1 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Last updated: November 14, 2025
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using ParkMate ("the App"), you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to these Terms of Service, please do 
            not use the App.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            2. Description of Service
          </Typography>
          <Typography variant="body1" paragraph>
            ParkMate provides a mobile application that helps users find available parking spaces in Singapore. 
            The App displays carpark information including location, availability, pricing, and other relevant 
            details sourced from public APIs and databases.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            3. User Accounts
          </Typography>
          <Typography variant="body1" paragraph>
            To access certain features of the App, you may be required to create an account. You agree to:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              Provide accurate, current, and complete information during registration
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Maintain the security of your password and account
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Accept responsibility for all activities that occur under your account
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Notify us immediately of any unauthorized use of your account
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            4. Use of Service
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to use the App only for lawful purposes and in accordance with these Terms. You agree not to:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              Use the App in any way that violates any applicable laws or regulations
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Attempt to interfere with or disrupt the App's functionality
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Use automated systems to access or collect data from the App
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Impersonate or attempt to impersonate ParkMate, employees, or other users
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            5. Location Services
          </Typography>
          <Typography variant="body1" paragraph>
            The App uses your device's location services to provide nearby carpark information. By using 
            location-based features, you consent to the collection and use of your location data as described 
            in our Privacy Policy. You may disable location services at any time through your device settings, 
            though this may limit certain App functionality.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            6. Carpark Information Accuracy
          </Typography>
          <Typography variant="body1" paragraph>
            While we strive to provide accurate and up-to-date carpark information, we do not guarantee the 
            accuracy, completeness, or reliability of any information displayed in the App. Carpark availability, 
            pricing, and other details may change without notice. Users should verify information independently 
            before making parking decisions.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            7. Intellectual Property Rights
          </Typography>
          <Typography variant="body1" paragraph>
            The App and its original content, features, and functionality are owned by ParkMate and are protected 
            by international copyright, trademark, patent, trade secret, and other intellectual property laws. 
            You may not copy, modify, distribute, sell, or lease any part of the App without our express permission.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            8. Third-Party Services
          </Typography>
          <Typography variant="body1" paragraph>
            The App may contain links to third-party websites or services (including Google Maps) that are not 
            owned or controlled by ParkMate. We have no control over and assume no responsibility for the content, 
            privacy policies, or practices of any third-party services. You acknowledge and agree that ParkMate 
            shall not be liable for any damage or loss caused by your use of such third-party services.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            9. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            To the maximum extent permitted by law, ParkMate shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages, including but not limited to loss of profits, data, 
            or other intangible losses resulting from:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 2 }}>
            <Typography component="li" variant="body1" paragraph>
              Your use or inability to use the App
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Any inaccurate carpark information provided by the App
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Unauthorized access to your account or data
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Any other matter relating to the App
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            10. Disclaimer of Warranties
          </Typography>
          <Typography variant="body1" paragraph>
            The App is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either 
            express or implied. ParkMate does not warrant that the App will be uninterrupted, secure, or error-free, 
            or that any defects will be corrected.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            11. Account Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to terminate or suspend your account and access to the App immediately, without 
            prior notice or liability, for any reason, including breach of these Terms. You may also delete your 
            account at any time through the Settings page. Upon termination, all provisions of these Terms which 
            by their nature should survive termination shall survive.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            12. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision 
            is material, we will provide at least 30 days' notice prior to any new terms taking effect. What 
            constitutes a material change will be determined at our sole discretion. By continuing to use the App 
            after revisions become effective, you agree to be bound by the revised terms.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            13. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms shall be governed and construed in accordance with the laws of Singapore, without regard 
            to its conflict of law provisions. Any disputes arising from these Terms or the use of the App shall 
            be subject to the exclusive jurisdiction of the courts of Singapore.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            14. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms of Service, please contact us at:
          </Typography>
          <Box sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body1" paragraph>
              Email: support@parkmate.sg
            </Typography>
            <Typography variant="body1" paragraph>
              Address: Singapore
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            15. Severability
          </Typography>
          <Typography variant="body1" paragraph>
            If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed 
            and interpreted to accomplish the objectives of such provision to the greatest extent possible under 
            applicable law, and the remaining provisions will continue in full force and effect.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            16. Entire Agreement
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms constitute the entire agreement between you and ParkMate regarding the use of the App, 
            superseding any prior agreements between you and ParkMate relating to your use of the App.
          </Typography>

          <Box sx={{ mt: 4, p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              By using ParkMate, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfServicePage;
