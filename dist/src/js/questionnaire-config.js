// Questionnaire configuration with conditional logic
const questionnaireConfig = {
    "startQuestion": "q1",
    "questions": {
        "q1": {
            "question": "What is your marital status?",
            "answers": {
                "Single": "q2",
                "Married": "q3",
                "Divorced": "q2",
                "Widowed": "q2"
            }
        },
        "q2": {
            "question": "Are you planning on getting married next year?",
            "answers": {
                "Yes": null,
                "No": null,
                "Maybe": null
            }
        },
        "q3": {
            "question": "How long have you been married?",
            "answers": {
                "Less than a year": "q4",
                "1-5 years": "q5",
                "More than 5 years": "q6"
            }
        },
        "q4": {
            "question": "Have you celebrated your one year anniversary?",
            "answers": {
                "Yes": null,
                "No": null,
                "Planning to": null
            }
        },
        "q5": {
            "question": "Do you have children?",
            "answers": {
                "Yes": "q7",
                "No": "q8",
                "Planning to have": "q8"
            }
        },
        "q6": {
            "question": "Are you satisfied with your marriage?",
            "answers": {
                "Very satisfied": "q9",
                "Somewhat satisfied": "q10",
                "Not satisfied": "q11"
            }
        },
        "q7": {
            "question": "How many children do you have?",
            "answers": {
                "1": null,
                "2": null,
                "3 or more": null
            }
        },
        "q8": {
            "question": "What are your future family plans?",
            "answers": {
                "Want children soon": null,
                "Want children later": null,
                "No children planned": null
            }
        },
        "q9": {
            "question": "What contributes most to your satisfaction?",
            "answers": {
                "Communication": null,
                "Shared values": null,
                "Emotional support": null,
                "Financial stability": null
            }
        },
        "q10": {
            "question": "What could improve your marriage?",
            "answers": {
                "More quality time": null,
                "Better communication": null,
                "Financial improvements": null,
                "More romance": null
            }
        },
        "q11": {
            "question": "Have you considered marriage counseling?",
            "answers": {
                "Yes, already doing it": null,
                "Yes, considering it": null,
                "No, not interested": null
            }
        }
    }
};