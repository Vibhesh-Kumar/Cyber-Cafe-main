// Seed script for the Bihar Cyber Café Digital Service Portal.
// Run with: pnpm --filter @workspace/db run seed
import { db, pool } from "./index";
import {
  categoriesTable,
  servicesTable,
  blogsTable,
  faqsTable,
  type ServiceFormField,
} from "./schema";

async function seed() {
  const categories: {
    slug: string;
    name: string;
    description: string;
    icon: string;
  }[] = [
    {
      slug: "certificates",
      name: "Certificates",
      description:
        "Birth, caste, income, and residence certificates issued by the Bihar government.",
      icon: "file-badge",
    },
    {
      slug: "education",
      name: "Education",
      description:
        "Scholarship applications, admit card downloads, and marksheet correction requests.",
      icon: "graduation-cap",
    },
    {
      slug: "banking",
      name: "Banking",
      description:
        "Bank account opening assistance, KYC updates, and passbook services.",
      icon: "landmark",
    },
    {
      slug: "utilities",
      name: "Utilities",
      description:
        "Electricity bill payments, new connection requests, and water bill services.",
      icon: "plug-zap",
    },
  ];

  const insertedCategories = await db
    .insert(categoriesTable)
    .values(categories)
    .onConflictDoNothing()
    .returning();

  const categoryBySlug = new Map(
    (
      insertedCategories.length
        ? insertedCategories
        : await db.select().from(categoriesTable)
    ).map((c) => [c.slug, c]),
  );

  const nameField = (label = "Full Name"): ServiceFormField => ({
    name: "fullName",
    label,
    type: "text",
    required: true,
  });

  type ServiceSeed = {
    categorySlug: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    estimatedDays: number;
    formSchema: ServiceFormField[];
    requiredDocuments: string[];
  };

  const services: ServiceSeed[] = [
    {
      categorySlug: "certificates",
      name: "Birth Certificate",
      slug: "birth-certificate",
      description:
        "Apply for an official birth certificate issued by the municipal corporation.",
      price: "50.00",
      estimatedDays: 7,
      formSchema: [
        nameField("Child's Full Name"),
        { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
        { name: "fatherName", label: "Father's Name", type: "text", required: true },
        { name: "motherName", label: "Mother's Name", type: "text", required: true },
        { name: "placeOfBirth", label: "Place of Birth", type: "text", required: true },
      ],
      requiredDocuments: ["Hospital discharge slip", "Parent's Aadhaar card"],
    },
    {
      categorySlug: "certificates",
      name: "Caste Certificate",
      slug: "caste-certificate",
      description:
        "Apply for a caste certificate required for reservation benefits and government schemes.",
      price: "80.00",
      estimatedDays: 15,
      formSchema: [
        nameField(),
        { name: "fatherName", label: "Father's Name", type: "text", required: true },
        { name: "caste", label: "Caste", type: "text", required: true },
        { name: "address", label: "Residential Address", type: "textarea", required: true },
      ],
      requiredDocuments: ["Aadhaar card", "Residence proof", "Father's caste certificate (if available)"],
    },
    {
      categorySlug: "certificates",
      name: "Income Certificate",
      slug: "income-certificate",
      description:
        "Apply for an income certificate needed for scholarships, loans, and subsidy schemes.",
      price: "60.00",
      estimatedDays: 10,
      formSchema: [
        nameField(),
        { name: "annualIncome", label: "Annual Family Income (₹)", type: "number", required: true },
        { name: "occupation", label: "Occupation", type: "text", required: true },
      ],
      requiredDocuments: ["Aadhaar card", "Salary slip or self-declaration"],
    },
    {
      categorySlug: "certificates",
      name: "Residence Certificate",
      slug: "residence-certificate",
      description: "Apply for proof of residence in Bihar.",
      price: "50.00",
      estimatedDays: 7,
      formSchema: [
        nameField(),
        { name: "address", label: "Current Address", type: "textarea", required: true },
        { name: "yearsAtAddress", label: "Years at This Address", type: "number", required: true },
      ],
      requiredDocuments: ["Aadhaar card", "Electricity bill or rent agreement"],
    },
    {
      categorySlug: "education",
      name: "Scholarship Application",
      slug: "scholarship-application",
      description:
        "Apply for state government scholarships for school and college students.",
      price: "0.00",
      estimatedDays: 20,
      formSchema: [
        nameField("Student's Full Name"),
        { name: "school", label: "School/College Name", type: "text", required: true },
        { name: "className", label: "Class/Year", type: "text", required: true },
        {
          name: "category",
          label: "Scholarship Category",
          type: "select",
          required: true,
          options: ["Merit-based", "Need-based", "Minority", "SC/ST/OBC"],
        },
      ],
      requiredDocuments: ["Aadhaar card", "Last exam marksheet", "Income certificate"],
    },
    {
      categorySlug: "education",
      name: "Marksheet Correction",
      slug: "marksheet-correction",
      description:
        "Request correction of name, date of birth, or other details on a board marksheet.",
      price: "150.00",
      estimatedDays: 30,
      formSchema: [
        nameField(),
        { name: "rollNumber", label: "Exam Roll Number", type: "text", required: true },
        { name: "correctionDetails", label: "Details of Correction Needed", type: "textarea", required: true },
      ],
      requiredDocuments: ["Original marksheet copy", "Aadhaar card"],
    },
    {
      categorySlug: "education",
      name: "Admit Card Download Assistance",
      slug: "admit-card-download",
      description:
        "Get help downloading and printing your board or competitive exam admit card.",
      price: "20.00",
      estimatedDays: 1,
      formSchema: [
        nameField(),
        { name: "rollNumber", label: "Registration/Roll Number", type: "text", required: true },
        { name: "examName", label: "Examination Name", type: "text", required: true },
      ],
      requiredDocuments: ["Registration confirmation email or SMS"],
    },
    {
      categorySlug: "banking",
      name: "Bank Account Opening Assistance",
      slug: "bank-account-opening",
      description:
        "Get help filling out and submitting a new savings account application.",
      price: "100.00",
      estimatedDays: 5,
      formSchema: [
        nameField(),
        { name: "preferredBank", label: "Preferred Bank", type: "text", required: true },
        { name: "accountType", label: "Account Type", type: "select", required: true, options: ["Savings", "Jan Dhan", "Current"] },
      ],
      requiredDocuments: ["Aadhaar card", "PAN card", "Passport-size photo"],
    },
    {
      categorySlug: "banking",
      name: "KYC Update",
      slug: "kyc-update",
      description: "Update your KYC details with your bank branch.",
      price: "40.00",
      estimatedDays: 3,
      formSchema: [
        nameField(),
        { name: "accountNumber", label: "Bank Account Number", type: "text", required: true },
        { name: "bankName", label: "Bank Name", type: "text", required: true },
      ],
      requiredDocuments: ["Aadhaar card", "PAN card"],
    },
    {
      categorySlug: "banking",
      name: "Passbook Reissue",
      slug: "passbook-reissue",
      description: "Apply for a new passbook if yours is lost, damaged, or full.",
      price: "30.00",
      estimatedDays: 5,
      formSchema: [
        nameField(),
        { name: "accountNumber", label: "Bank Account Number", type: "text", required: true },
        { name: "reason", label: "Reason for Reissue", type: "select", required: true, options: ["Lost", "Damaged", "Pages Full"] },
      ],
      requiredDocuments: ["Aadhaar card", "Old passbook (if available)"],
    },
    {
      categorySlug: "utilities",
      name: "New Electricity Connection",
      slug: "new-electricity-connection",
      description: "Apply for a new domestic or commercial electricity connection.",
      price: "200.00",
      estimatedDays: 14,
      formSchema: [
        nameField(),
        { name: "address", label: "Installation Address", type: "textarea", required: true },
        { name: "connectionType", label: "Connection Type", type: "select", required: true, options: ["Domestic", "Commercial"] },
      ],
      requiredDocuments: ["Aadhaar card", "Proof of property ownership or rent agreement"],
    },
    {
      categorySlug: "utilities",
      name: "Electricity Bill Payment",
      slug: "electricity-bill-payment",
      description: "Pay your electricity bill through the cyber café counter.",
      price: "10.00",
      estimatedDays: 1,
      formSchema: [
        { name: "consumerNumber", label: "Consumer Number", type: "text", required: true },
        { name: "billAmount", label: "Bill Amount (₹)", type: "number", required: true },
      ],
      requiredDocuments: ["Latest electricity bill copy"],
    },
    {
      categorySlug: "utilities",
      name: "Water Connection Request",
      slug: "water-connection-request",
      description: "Apply for a new municipal water supply connection.",
      price: "150.00",
      estimatedDays: 20,
      formSchema: [
        nameField(),
        { name: "address", label: "Installation Address", type: "textarea", required: true },
      ],
      requiredDocuments: ["Aadhaar card", "Proof of property ownership"],
    },
  ];

  for (const svc of services) {
    const category = categoryBySlug.get(svc.categorySlug);
    if (!category) continue;
    await db
      .insert(servicesTable)
      .values({
        categoryId: category.id,
        name: svc.name,
        slug: svc.slug,
        description: svc.description,
        price: svc.price,
        estimatedDays: svc.estimatedDays,
        formSchema: svc.formSchema,
        requiredDocuments: svc.requiredDocuments,
      })
      .onConflictDoNothing();
  }

  await db
    .insert(blogsTable)
    .values([
      {
        slug: "how-to-apply-for-caste-certificate",
        title: "How to Apply for a Caste Certificate in Bihar",
        excerpt:
          "A step-by-step guide to applying for your caste certificate through our portal.",
        content:
          "Applying for a caste certificate is now easier than ever. Visit your nearest Bihar Cyber Café, choose the Caste Certificate service, fill in your details, upload your Aadhaar card and residence proof, and pay the nominal service fee. Your application is typically processed within 15 days, and you can track its status online at any time using your application number.",
        authorName: "Bihar Cyber Café Team",
      },
      {
        slug: "scholarship-schemes-2026",
        title: "Government Scholarship Schemes to Watch in 2026",
        excerpt:
          "An overview of the major state scholarship schemes students should apply for this year.",
        content:
          "Bihar offers several scholarship schemes for students across school and college levels, including merit-based, need-based, and minority scholarships. Applications typically open at the start of the academic year. Visit our Education services section to apply with the help of our trained operators, who will ensure your documents are complete before submission.",
        authorName: "Bihar Cyber Café Team",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(faqsTable)
    .values([
      {
        question: "How long does it take to process my application?",
        answer:
          "Processing times vary by service, typically between 1 and 30 days. You can see the estimated turnaround on each service's detail page and track live status using your application number.",
        category: "General",
      },
      {
        question: "How do I track my application?",
        answer:
          "Use the Track Application page and enter your application number along with the email you registered with.",
        category: "General",
      },
      {
        question: "What documents do I need to upload?",
        answer:
          "Each service lists its required documents on its detail page. You'll be prompted to upload them during the application process.",
        category: "Documents",
      },
      {
        question: "How do I pay for a service?",
        answer:
          "After submitting your application and documents, you'll be taken to a payment step where you can complete payment for the service instantly.",
        category: "Payments",
      },
    ])
    .onConflictDoNothing();

  console.log("Seed complete.");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
