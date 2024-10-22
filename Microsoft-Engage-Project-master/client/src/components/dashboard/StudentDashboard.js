import React, { useState } from "react";
import PropTypes from "prop-types";
import TextField from '@mui/material/TextField';
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import { useHistory } from "react-router-dom";

function StudentDashboard(props) {

    const [exam_code, setExamCode] = useState("");
    const [error, setError] = useState("");

    const axios = require("axios");
    const history = useHistory();

    /**
     * This function is called when the student enters the exam code to start the exam.
     * It checks the exam code. If invalid, it displays an error.
     * If valid, it allows the student to enter the exam.
     */
    function checkExamCode() {
        // Send exam code to server
        axios.get('/api/exams/examByCode?exam_code=' + exam_code)
            .then(function (response) {
                // If exam code is right
                console.log(response);
                setError("Starting exam");

                // Pass data to the exam page and start the exam
                let data = {
                    exam_code: exam_code,
                    student_name: props.name,
                    student_email: props.student_email,
                    exam_link: response.data.exam_link,
                    prof_email: response.data.prof_email,
                    // No need to calculate time remaining as the exam can be started anytime
                };
                history.push({
                    pathname: '/test',
                    state: data
                });
            })
            .catch(function (error) {
                // If exam code is invalid, show an error
                console.log(error);
                setError("Exam code is invalid");
            });
    }

    return (
        <div style={{ height: "75vh" }} className="container valign-wrapper">
            <div className="row">
                <div className="col s12 center-align">
                    <h4>
                        <b>Hey there,</b> {props.name.split(" ")[0]}
                        <p className="flow-text grey-text text-darken-1">
                            Please enter the Exam Code to start the exam
                        </p>
                    </h4>
                    <TextField
                        autoFocus
                        padding="10px"
                        margin="20px"
                        variant="standard"
                        id="exam_code"
                        label="Exam Code"
                        type="text"
                        required={true}
                        value={exam_code}
                        onChange={(e) => setExamCode(e.target.value)}
                    />
                    <button
                        style={{
                            width: "200px",
                            borderRadius: "3px",
                            letterSpacing: "1.5px",
                            marginTop: "1rem",
                            marginLeft: "1rem"
                        }}
                        onClick={checkExamCode}
                        className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                    >
                        Start Exam
                    </button>
                    <button
                        style={{
                            width: "200px",
                            borderRadius: "3px",
                            letterSpacing: "1.5px",
                            marginTop: "1rem",
                            marginLeft: "1rem"
                        }}
                        onClick={props.logoutUser}
                        className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                    >
                        Logout
                    </button>
                    <br />
                    <p style={{ color: "red" }}>{error}</p>
                </div>
            </div>
        </div>
    );
}

StudentDashboard.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(StudentDashboard);
