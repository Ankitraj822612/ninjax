const express = require("express");
const router = express.Router();

const Logs = require("../../models/Logs");

/**
 * POST request on /logs/update is made by the exam window every second.
 * If there exists no entry in the database corresponding to the given pair of exam_code and student_email,
 * it creates a new one; otherwise, it replaces the old one.
 */
router.post("/update", (req, res) => {
    Logs.findOneAndUpdate(
        { exam_code: req.body.exam_code, student_email: req.body.student_email },
        req.body,
        { upsert: true },
        function (err, doc) {
            if (err) {
                return res.status(400).json("Error Occurred");
            }
            return res.status(200).json("Success");
        }
    );
});

/**
 * GET request on /logs/logByEmail with exam_code and student_email query parameters.
 * This request is made whenever a student presses the start exam button to check whether
 * the student is taking this exam for the first time or if they exited and rejoined.
 */
router.get("/logByEmail", (req, res) => {
    const req_exam_code = req.query.exam_code;
    const req_student_email = req.query.student_email;

    Logs.findOne({ exam_code: req_exam_code, student_email: req_student_email }).then(log => {
        if (!log) {
            return res.status(400).json("Student Taking exam for the first time");
        }
        return res.status(200).json(log);
    });
});

/**
 * POST request to get all student data for the given exam code.
 */
router.post("/allData", (req, res) => {
    Logs.find({ exam_code: req.body.exam_code }, function (err, docs) {
        if (err) {
            return res.status(400).json("Error Occurred");
        }
        return res.status(200).json(docs);
    });
});

module.exports = router;
