const mongoose = require('mongoose');

// Sub-schema for individual fields within a dynamic section
const fieldSchema = new mongoose.Schema({
    label: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed }, // Can be String, Array, or Boolean
    fieldType: {
        type: String,
        enum: ['text', 'textarea', 'array', 'boolean'],
        default: 'text'
    }
}, { _id: false });

// Sub-schema for the dynamic section itself
const sectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isVisible: { type: Boolean, default: true },
    layoutType: {
        type: String,
        enum: ['grid-2', 'full-width', 'checklist', 'cards'],
        default: 'full-width'
    },
    order: { type: Number, default: 0 },
    fields: [fieldSchema]
});

const solutionSchema = new mongoose.Schema({
    // --- MAIN PAGE (Solution Listing Section) ---
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    category: { type: String, required: true },
    startingPrice: { type: String, required: true },
    ctaText: { type: String, default: 'Learn More' }, // Default CTA
    slug: { type: String, required: true, unique: true }, // For URL generation

    // --- SOLUTION DETAIL PAGE (Inside Individual Solution Page) ---
    // 🔹 Overview Section
    detailedDescription: { type: String },
    problemsSolved: [{ type: String }],
    targetAudience: [{ type: String }],

    // 🔹 Offering Details
    keyFeatures: [{ type: String }],
    coverageAreas: [{ type: String }],
    technologies: [{ type: String }],

    // 🔹 Experience & Credibility
    yearsExperience: { type: String },
    projectsCompleted: { type: String },
    industriesServed: [{ type: String }],

    // 🔹 Delivery & Commercials
    timeline: { type: String },
    pricingModel: { type: String },

    // 🔹 Trust & Proof
    caseStudies: { type: String },
    testimonials: [{
        name: { type: String },
        role: { type: String },
        comment: { type: String }
    }],
    certifications: [{ type: String }],
    partnerships: [{ type: String }],

    // 🔹 Support & Assurance
    supportDetails: { type: String },
    securityDetails: { type: String },

    // 🔹 CTA SECTIONS
    primaryCta: { type: String },
    secondaryCta: { type: String },
    consultationAvailability: { type: Boolean, default: true },

    // 🔹 Help & Conversion Boosters
    faqs: [{
        question: { type: String },
        answer: { type: String }
    }],
    nextSteps: { type: String },

    // 🔹 Dynamic Sections
    dynamicSections: {
        type: [sectionSchema],
        default: []
    },

    // 🔹 Dynamic Inquiry Form Configuration
    // Section Visibility Flags
    isOverviewVisible: { type: Boolean, default: true },
    isOfferingVisible: { type: Boolean, default: true },
    isExperienceVisible: { type: Boolean, default: true },
    isDeliveryVisible: { type: Boolean, default: true },
    isTrustVisible: { type: Boolean, default: true },
    isTestimonialsVisible: { type: Boolean, default: true },
    isFaqsVisible: { type: Boolean, default: true },
    isCtaVisible: { type: Boolean, default: true },

    inquiryFormFields: [{
        label: { type: String, required: true },
        fieldType: { type: String, enum: ['text', 'textarea', 'dropdown', 'checkbox', 'radio'], default: 'text' },
        options: [{ type: String }],
        required: { type: Boolean, default: false },
        isVisible: { type: Boolean, default: true },
        placeholder: { type: String }
    }],

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Solution', solutionSchema);
