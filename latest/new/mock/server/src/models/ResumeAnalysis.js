import mongoose from "mongoose";

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    extractedText: {
      type: String
    },
    analysis: {
      overallScore: {
        type: Number,
        min: 0,
        max: 100
      },
      atsScore: {
        type: Number,
        min: 0,
        max: 100
      },
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
      sections: {
        contactInfo: {
          present: Boolean,
          score: Number,
          feedback: String
        },
        summary: {
          present: Boolean,
          score: Number,
          feedback: String
        },
        experience: {
          present: Boolean,
          score: Number,
          feedback: String
        },
        education: {
          present: Boolean,
          score: Number,
          feedback: String
        },
        skills: {
          present: Boolean,
          score: Number,
          feedback: String
        },
        projects: {
          present: Boolean,
          score: Number,
          feedback: String
        }
      },
      keywords: {
        found: [String],
        missing: [String],
        suggestions: [String]
      },
      formatting: {
        score: Number,
        feedback: String
      }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);