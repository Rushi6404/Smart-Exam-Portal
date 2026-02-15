import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";
import axios from "axios";
import swal from "sweetalert";

const ProctoringMonitor = ({ quizId, userId, token, onTabSwitch }) => {
    const webcamRef = useRef(null);
    const [warningMsg, setWarningMsg] = useState("");
    const callbackRef = useRef(onTabSwitch);

    useEffect(() => {
        callbackRef.current = onTabSwitch;
    }, [onTabSwitch]);

    const loadModels = async () => {
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    };

    const logViolation = async (type) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.post("/api/proctoring/log", {
                userId: userId,
                quizId: quizId,
                violationType: type,
            }, config);
        } catch (error) {
            console.error("Error logging violation", error);
        }
    };

    const detect = async () => {
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            const video = webcamRef.current.video;
            const detections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions()
            );

            if (detections.length === 0) {
                setWarningMsg("⚠️ WARNING: No face detected! Please look at the camera.");
                logViolation("NO_FACE");
            } else if (detections.length > 1) {
                setWarningMsg("⚠️ WARNING: Multiple faces detected! Collusion suspected.");
                logViolation("MULTIPLE_FACES");
            } else {
                setWarningMsg("");
            }
        }
    };

    useEffect(() => {
        loadModels();
        const interval = setInterval(() => {
            detect();
        }, 3000); // Check every 3 seconds

        // Tab Switch Detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                logViolation("TAB_SWITCH");
                if (callbackRef.current) {
                    callbackRef.current();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return (
        <div style={{ width: "100%", marginBottom: "15px", background: "white", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h6 style={{ marginBottom: "10px" }}>Proctoring Active</h6>
            <Webcam
                ref={webcamRef}
                muted={true}
                style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "5px",
                    border: warningMsg ? "3px solid red" : "2px solid green"
                }}
            />
            {warningMsg && <p style={{ color: "red", fontWeight: "bold", fontSize: "12px", marginTop: "5px" }}>{warningMsg}</p>}
        </div>
    );
};

export default ProctoringMonitor;
