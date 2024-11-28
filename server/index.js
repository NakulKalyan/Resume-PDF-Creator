const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
const upload = multer();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '../public')));

// Handle PDF generation
app.post('/generate-pdf', upload.single('photo'), (req, res) => {
  try {
    const { name, phone, email, linkedIn, github, education, internship, projects, certifications, skills } = req.body;

    // Validate required fields
    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Name, phone, and email are required.' });
    }

    // Parse comma-separated values
    const educationList = education ? education.split(',') : [];
    const internshipList = internship ? internship.split(',') : [];
    const projectList = projects ? projects.split(',') : [];
    const certificationList = certifications ? certifications.split(',') : [];
    const skillList = skills ? skills.split(',') : [];

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    const filename = `${name.replace(/\s+/g, '_')}_resume.pdf`;

    // Set response headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Function to add a border to every page
    const addBorder = () => {
      doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke('#007ACC');
    };

    // Event Listener to Add Borders on New Pages
    doc.on('pageAdded', addBorder);

    // Add border to the first page
    addBorder();

    // Add Name and Contact Information
    doc.fontSize(20).font('Helvetica-Bold').text(name, 50, 50);
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Phone: ${phone}`);
    doc.text(`Email: ${email}`);
    if (linkedIn) doc.text(linkedIn);
    if (github) doc.text(github);

    // Add Passport-Sized Photo (if uploaded)
    if (req.file) {
      const photoBuffer = req.file.buffer;
      doc.rect(doc.page.width - 150, 40, 100, 100).stroke('#007ACC'); // Photo border
      doc.image(photoBuffer, doc.page.width - 145, 45, { width: 90, height: 90 });
    }

    // Function to Add Section Headers
    const addSectionHeader = (title) => {
      doc.moveDown(1).fontSize(14).fillColor('#007ACC').text(title);
      doc.moveTo(50, doc.y + 2).lineTo(doc.page.width - 50, doc.y + 2).stroke('#007ACC');
    };

    // Function to Add Section Content
    const addSectionContent = (list) => {
      list.forEach((item) => {
        doc.fontSize(12).fillColor('#000').text(item.trim());
        if (doc.y > 700) {
          doc.addPage();
        }
      });
    };

    // Add Education Section
    if (educationList.length > 0) {
      addSectionHeader('Education');
      addSectionContent(educationList);
    }

    // Add Internship Section
    if (internshipList.length > 0) {
      addSectionHeader('Internship Experience');
      addSectionContent(internshipList);
    }

    // Add Projects Section
    if (projectList.length > 0) {
      addSectionHeader('Projects');
      addSectionContent(projectList);
    }

    // Add Certifications Section
    if (certificationList.length > 0) {
      addSectionHeader('Certifications');
      addSectionContent(certificationList);
    }

    // Add Skills Section with Shaded Background
    if (skillList.length > 0) {
      addSectionHeader('Skills');
      doc.rect(50, doc.y, doc.page.width - 100, 30).fill('#f5f5f5').stroke('#007ACC');
      doc.fillColor('#000').fontSize(12).text(skillList.join(', '), 60, doc.y + 5);
    }

    // Finalize the PDF
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
