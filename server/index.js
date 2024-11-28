const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '../public')));

// Handle PDF generation
app.post('/generate-pdf', upload.single('photo'), (req, res) => {
  const { name, phone, email, linkedIn, github, education, internship, projects, certifications, skills } = req.body;

  // Parse comma-separated values
  const educationList = education.split(',');
  const internshipList = internship.split(',');
  const projectList = projects.split(',');
  const certificationList = certifications.split(',');
  const skillList = skills.split(',');

  // Create a new PDF document
  const doc = new PDFDocument({ margin: 50 });
  const filename = `${name.replace(/\s+/g, '_')}_resume.pdf`;

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
  doc.text(linkedIn);
  doc.text(github);

  // Add Passport-Sized Photo
  if (req.file) {
    doc.rect(doc.page.width - 150, 40, 100, 100).stroke('#007ACC'); // Photo border
    doc.image(req.file.path, doc.page.width - 145, 45, { width: 90, height: 90 });
  }

  // Function to Add Section Headers
  const addSectionHeader = (title) => {
    doc.moveDown(1).fontSize(14).fillColor('#007ACC').text(title);
    doc.moveTo(50, doc.y + 2).lineTo(doc.page.width - 50, doc.y + 2).stroke('#007ACC');
  };

  // Add Education Section
  addSectionHeader('Education');
  educationList.forEach(edu => {
    doc.fontSize(12).fillColor('#000').text(edu.trim());
    if (doc.y > 700) {
      doc.addPage(); // Add a new page if content exceeds current page
    }
  });

  // Add Internship Section
  addSectionHeader('Internship Experience');
  internshipList.forEach(intern => {
    doc.fontSize(12).fillColor('#000').text(intern.trim());
    if (doc.y > 700) {
      doc.addPage(); // Add a new page if content exceeds current page
    }
  });

  // Add Projects Section
  addSectionHeader('Projects');
  projectList.forEach(project => {
    doc.fontSize(12).fillColor('#000').text(project.trim());
    if (doc.y > 700) {
      doc.addPage(); // Add a new page if content exceeds current page
    }
  });

  // Add Certifications Section
  addSectionHeader('Certifications');
  certificationList.forEach(cert => {
    doc.fontSize(12).fillColor('#000').text(cert.trim());
    if (doc.y > 700) {
      doc.addPage(); // Add a new page if content exceeds current page
    }
  });

  // Add Skills Section with Shaded Background
  addSectionHeader('Skills');
  doc.rect(50, doc.y, doc.page.width - 100, 30).fill('#f5f5f5').stroke('#007ACC');
  doc.fillColor('#000').fontSize(12).text(skillList.join(', '), 60, doc.y + 5);

  // Finalize the PDF
  doc.pipe(res);
  doc.end();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
