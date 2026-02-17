import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import * as faceapi from 'face-api.js';

import './App.css';

function App() {
  const [view, setView] = useState('main');
  const [password, setPassword] = useState('');
  const [studentID, setStudentID] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [votes, setVotes] = useState({});
  const [selectedVotes, setSelectedVotes] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasVotedById, setHasVotedById] = useState({});
  const [capturedIDPhoto, setCapturedIDPhoto] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [faceCameraStream, setFaceCameraStream] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isIDConfirmed, setIsIDConfirmed] = useState(false);
  const [isFaceConfirmed, setIsFaceConfirmed] = useState(false);
  const [idFaceDescriptor, setIdFaceDescriptor] = useState(null);
  const [idImage, setIdImage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [idFacePreview, setIdFacePreview] = useState(null);
  const [showFaceVerifiedPopup, setShowFaceVerifiedPopup] = useState(false);
  const [voterAccounts, setVoterAccounts] = useState({});
  const [partylist, setPartylist] = useState('');
  const [partylistColor, setPartylistColor] = useState('#000000');
  const [editingPosition, setEditingPosition] = useState(null);
  const [receiptData, setReceiptData] = useState([]);
  const [isIDAlreadySignedIn, setIsIDAlreadySignedIn] = useState(false);
  const [selectedPartylist, setSelectedPartylist] = useState('');
  const [lastStraightVote, setLastStraightVote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dots, setDots] = useState("");
  const [checkingID, setCheckingID] = useState(false);
  

  const [stepsDone, setStepsDone] = useState({
    step1: false,  // Step 1 not done initially
    step2: false,  // Step 2 depends on Step 1
    step3: false   // Step 3 depends on Step 2
  });
  const [eyeBlinkDetected, setEyeBlinkDetected] = useState(false);
  const eyeClosedFramesRef = useRef(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [idResult, setIdResult] = useState(null); 
// null | 'success' | 'fail'
const [code, setCode] = useState('');
const [codeEntered, setCodeEntered] = useState(""); // the input field
const [codeUsed, setCodeUsed] = useState("");       // the code verified & ready to use

const API_BASE_URL = "https://mcii-backend.onrender.com";


const [verifiedCode, setVerifiedCode] = useState(null);
const [usedCodes, setUsedCodes] = useState(new Set());
const [loadingResults, setLoadingResults] = useState(true);




  
  

  
  



  

  
  

  
  
  

  

  

  
  
  
  



  const [recordedVotes, setRecordedVotes] = useState({
    votesCount: {},      // Tracks vote counts
    voteRecords: []      // Tracks who voted and their selections
  });
  const [studentName, setStudentName] = useState('');
  const validVoters = {
    
  };

  const positions = [
    "President", "Vice President", "Secretary", "Auditor",
    "Treasurer", "PIO", "BSCS Represent.", "BEED Represent.","BSHM Represent.",
    "Crim. Represent.", "Pharma. Represent.", "Midwifery Represent."
  ];
  const videoRef = useRef(null);
  const canvasRef = useRef();
  const faceDetectionInterval = useRef(null);

  const resetFormForNextUser = () => {
    setFirstName('');
    setMiddleInitial('');
    setLastName('');
    setCourse('');
    setYearLevel('');
    setPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordError('');
    setIsIDConfirmed(false);
    setIsFaceConfirmed(false);
    setStudentID('');
  };
  

  
  const checkIDOnServer = async (id) => {
    if (!id) return;

    setCheckingID(true);
    try {
      const res = await fetch(`${API_BASE_URL}/check-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentID: id }),
      });
      const data = await res.json();

      setIsIDAlreadySignedIn(data.alreadyVoted);
    } catch (err) {
      console.error("Error checking ID:", err);
      setIsIDAlreadySignedIn(false);
    } finally {
      setCheckingID(false);
    }
  };

  
    // get unique partylist from existing candidates
  const availablePartylists = [...new Set(candidates.map(c => c.partylist))];


  const handleAddCandidate = () => {
  const newCandidates = [];

  positions.forEach((pos) => {
    // Add two candidates per position with unique random avatars
    const randomAvatar1 = `https://i.pravatar.cc/200?u=${pos}-1-${Date.now()}-${Math.random()}`;
    const randomAvatar2 = `https://i.pravatar.cc/200?u=${pos}-2-${Date.now()}-${Math.random()}`;

    newCandidates.push({
      position: pos,
      name: `${pos} Candidate 1`,
      courseYear: "BSCS 4",
      partylist: "Blue Partylist",
      partylistColor: "#0000FF",
      photo: randomAvatar1
    });

    newCandidates.push({
      position: pos,
      name: `${pos} Candidate 2`,
      courseYear: "BSCS 4",
      partylist: "Red Partylist",
      partylistColor: "#FF0000",
      photo: randomAvatar2
    });
  });

  setCandidates((prev) => [...prev, ...newCandidates]);

  alert("✅ 2 candidates added per position with unique profile pictures!");
  if (!selectedPosition || !candidateName || !courseYear) {
    alert("⚠️ Please fill in Position, Candidate Name, and Course/Year");
    return;
  }

  const newCandidate = {
    position: selectedPosition,
    name: candidateName,
    courseYear: courseYear,
    partylist: partylist || '',       // optional
    partylistColor: partylistColor || '#000', // default black
    photo: photo || null
  };

  

  // Reset form
  setSelectedPosition('');
  setCandidateName('');
  setCourseYear('');
  setPartylist('');
  setPartylistColor('#000');
  setPhoto(null);
  setEditingIndex(null);

};


const StepButton = ({ stepKey, stepLabel, title, enabled, stepsDone, setStepsDone }) => {
  const done = stepsDone[stepKey]; // Is this step done?

  // Check if previous step is done
  const isPreviousStepDone = (key) => {
    if (key === 'step1') return true; // Step 1 has no previous
    if (key === 'step2') return stepsDone.step1;
    if (key === 'step3') return stepsDone.step2;
    return false;
  };

  const prevDone = isPreviousStepDone(stepKey);

  return (
    <button
      type="button"
      disabled={!enabled || done || !prevDone} // disable if previous step not done
      
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: done ? 'none' : '1px solid rgba(0,0,0,0.30)',
        borderRadius: '6px',
        padding: '6px 10px',
        textAlign: 'left',
        cursor: done || !enabled || !prevDone ? 'default' : 'pointer',
        boxShadow: done ? 'none' : '0 1px 3px rgba(0,0,0,0.20)',
        pointerEvents: done || !enabled || !prevDone ? 'none' : 'auto',
        opacity: prevDone ? 1 : 0.5, // faded if previous step not done
        filter: prevDone ? 'none' : 'blur(1px)', // slight blur effect
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ color: '#a5b9aa' }}>{stepLabel}</div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '15px',
          fontWeight: 'bold',
          color: done ? 'green' : '#4a90e2'
        }}
      >
        {title}
        {done ? (
          <span>✅</span>
        ) : prevDone ? (
          <div className="spinner" /> // show spinner only if previous step done
        ) : null}
      </div>
    </button>
  );
};





  
const handleEditCandidate = (realIndex) => {

  const candidate = candidates[realIndex];

  if (!candidate) {
    alert("Candidate not found.");
    return;
  }

  setSelectedPosition(candidate.position);
  setCandidateName(candidate.name);
  setCourseYear(candidate.courseYear);
  setPartylist(candidate.partylist || '');
  setPartylistColor(candidate.partylistColor || '#000000');
  setPhoto(candidate.photo || null);

  // ⭐ VERY IMPORTANT
  setEditingIndex(realIndex);
};


  
const handleDeleteCandidate = async (realIndex) => {
  if (!window.confirm('Are you sure you want to delete this candidate?')) return;

  try {
    const res = await fetch(`https://mcii-voting-system.onrender.com/candidates/${realIndex}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to delete candidate');
      return;
    }

    // ✅ Update UI instantly
    setCandidates(prev => prev.filter((_, i) => i !== realIndex));

    alert('✅ Candidate deleted successfully!');
  } catch (err) {
    console.error(err);
    alert('❌ Server error deleting candidate');
  }
};


  
  
  const getEAR = (eye) => {
    const A = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
    const B = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
    const C = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
    return (A + B) / (2.0 * C);
  };
  

  const detectEyeBlink = async () => {
    if (!modelsLoaded) return;
    if (!videoRef.current) return;
    if (eyeBlinkDetected) return;
  
    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
      )
      .withFaceLandmarks(true); // 👈 IMPORTANT
  
    if (!detection) return;
  
    const leftEye = detection.landmarks.getLeftEye();
    const rightEye = detection.landmarks.getRightEye();
  
    // get eye height (top-bottom)
    const leftEyeHeight = Math.abs(leftEye[1].y - leftEye[5].y);
    const rightEyeHeight = Math.abs(rightEye[1].y - rightEye[5].y);
  
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
  
    // 👁️ VERY SIMPLE BLINK RULE
    if (avgEyeHeight < 1) {
      setEyeBlinkDetected(true); // ✅ BLINK!
    }
  };
  
  

  const handleSubmit = async () => {
    if (!selectedPosition || !candidateName || !courseYear) {
      alert("⚠️ Fill Position, Candidate Name, and Course/Year");
      return;
    }
  
    const newCandidate = {
      position: selectedPosition,
      name: candidateName,
      courseYear,
      partylist,
      partylistColor,
      photo
    };
  
    try {
      const res = await fetch('https://mcii-voting-system.onrender.com//add-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCandidate)
      });
  
      console.log('res.status:', res.status);
      console.log('res.headers:', [...res.headers]);
  
      const text = await res.text(); // read raw text first
      console.log('res.text():', text);
  
      let data;
      try {
        data = JSON.parse(text); // parse JSON
      } catch (err) {
        console.error('Error parsing JSON:', err);
        alert('❌ Server returned invalid JSON. Check console.');
        return;
      }
  
      if (res.ok) {
        // add to UI immediately
        setCandidates(prev => [...prev, { id: data.id, ...newCandidate }]);
        alert('✅ Candidate saved successfully!');
        await fetchCandidates();
  
        // Reset form
        setSelectedPosition('');
        setCandidateName('');
        setCourseYear('');
        setPartylist('');
        setPartylistColor('#000000');
        setPhoto(null);
      } else {
        alert(`❌ Failed: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Failed to submit candidate: ' + err.message);
    }
  };
  

  
  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/results`);
      const data = await res.json();
      setRecordedVotes(data);
      setExpandedVoters(new Array(data.voteRecords.length).fill(false)); // reset expand state
      setLoadingResults(false);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    }
  };
  
  
  
  const toggleVoterExpand = (index) => {
    setExpandedVoters(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };
  
  
  const [expandedVoters, setExpandedVoters] = useState({});
  const handleDeleteVoter = async (studentID) => {

    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete this voter's record?"
    );
    if (!confirmDelete) return;
  
    try {
  
      const res = await fetch(`${API_BASE_URL}/vote-record/${studentID}`, {
        method: 'DELETE',
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      // ✅ Remove from UI instantly (NO INDEX NEEDED)
      const newVoteRecords = recordedVotes.voteRecords.filter(
        r => r.studentID !== studentID
      );
  
      // ✅ Reload results from server (MOST RELIABLE)
      fetchResults();   // ⭐ VERY IMPORTANT
  
      setRecordedVotes(prev => ({
        ...prev,
        voteRecords: newVoteRecords
      }));
  
      alert("✅ Voter deleted successfully!");
  
    } catch (err) {
  
      console.error("Delete voter error:", err);
      alert("❌ Failed to delete voter.");
  
    }
  };
  
  
  
  
  const handleIDUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      // Resize for mobile / speed
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      const scale = 1000 / img.width; // max width 1000px
      canvas.width = 1000;
      canvas.height = img.height * scale;
  
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
      // Convert canvas to data URL (JPEG)
      const resizedDataURL = canvas.toDataURL("image/jpeg");
  
      // 🔹 1. OCR
      const ocrResult = await Tesseract.recognize(resizedDataURL, 'eng', {
        logger: m => console.log("OCR progress:", m)
      });
      console.log("OCR text:", ocrResult.data.text);
  
      // 🔹 2. Face Detection
      const resizedImgElement = new Image();
      resizedImgElement.src = resizedDataURL;
      resizedImgElement.onload = async () => {
        const detection = await faceapi
          .detectSingleFace(resizedImgElement)
          .withFaceLandmarks()
          .withFaceDescriptor();
  
        if (detection) {
          const box = detection.detection.box;
          const faceCanvas = document.createElement("canvas");
          faceCanvas.width = box.width;
          faceCanvas.height = box.height;
  
          const faceCtx = faceCanvas.getContext("2d");
          faceCtx.drawImage(
            resizedImgElement,
            box.x,
            box.y,
            box.width,
            box.height,
            0,
            0,
            box.width,
            box.height
          );
  
          const faceImageURL = faceCanvas.toDataURL();
          setIdFacePreview(faceImageURL); // save the face preview in state
        } else {
          console.log("No face detected on ID");
        }
      };
    };
  };
  

  const handleSubmitTemp = async () => {
    if (!selectedPosition || !candidateName || !courseYear) {
      alert("⚠️ Fill Position, Candidate Name, and Course/Year");
      return;
    }
  
    let photoUrl = '/default-avatar.png';
    if (photo) {
      photoUrl = await handlePhotoUpload(photo); // Upload first
    }
  
    const newCandidate = {
      position: selectedPosition,
      name: candidateName,
      courseYear,
      partylist,
      partylistColor: partylistColor || '#000000',
      photo: photoUrl // store the URL, not the File object
    };
  
    try {
      const res = await fetch('https://mcii-voting-system.onrender.com/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCandidate)
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert('✅ Candidate saved to server!');
        fetchCandidates(); // refresh list
      } else {
        alert('❌ Failed to save candidate: ' + data.message);
      }
  
      // Reset form
      setSelectedPosition('');
      setCandidateName('');
      setCourseYear('');
      setPartylist('');
      setPartylistColor('#000000');
      setPhoto(null);
      setEditingIndex(null);
  
    } catch (err) {
      console.error(err);
      alert('❌ Error connecting to server');
    }
  };

  const handlePhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
  
    const res = await fetch('https://mcii-voting-system.onrender.com//upload-photo', {
      method: 'POST',
      body: formData,
    });
  
    const data = await res.json();
    return data.url; // permanent URL to save in Redis
  };

  const feetchCandidates = async () => {
    try {
      const res = await fetch('https://mcii-voting-system.onrender.com//candidates');
      const data = await res.json();
      setCandidates(data); // updates the state with Redis data
    } catch (err) {
      console.error('Failed to load candidates:', err);
      alert('❌ Could not load candidates from Redis.');
    }
  };
  
  
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  const fetchCandidates = async () => {
    try {
      const res = await fetch('https://mcii-voting-system.onrender.com//candidates');
      const data = await res.json();
      setCandidates(data); // from Redis only
    } catch (err) {
      console.error('Failed to load candidates:', err);
    }
  };

  
  const resetForm = () => {
    setCandidateName('');
    setCourseYear('');
    setPhoto(null);
    setPhotoPreview(null);
    setSelectedPosition('');
    setEditingIndex(null);
  };
  
  
  const handleVoterClick = () => {
    setIsLoading(true);          // Show loading
    setTimeout(() => {
      setIsLoading(false);       // Hide loading
      setView('voterInput');       // Navigate to 
    }, 1000); // 2 seconds
  };

  const handleBackClick = () => {
    setIsLoading(true);
    setTimeout(() => {
    setIsLoading(false);
    setView('main');
    setPassword('');
    setStudentID('');
    resetForm();
  }, 1000);
  };
  const handleEnterClick = () => {
    if (view === 'password') {
      if (password === 'adimin') {
        setIsLoading(true);
        setTimeout(() => {
        setIsLoading(false);       // Hide loading
        setView('adminMenu');       // Navigate to  screen
        }, 1000); // 1 second
        
      } else {
        alert('🔐 Incorrect password!');
      }
    } else if (view === 'voterInput') {
      if (validVoters[studentID]) {
        setStudentName(validVoters[studentID]);
        setSelectedVotes({});
        setHasSubmitted(false);
        setView('voterWelcome');
      } else {
        alert('❌ Invalid Student ID!');
      }
    }
  };
  useEffect(() => {
    fetchResults(); // initial fetch
  
    const interval = setInterval(fetchResults, 5000); // fetch every 5 sec
  
    return () => clearInterval(interval); // cleanup on unmount
  }, []);
  
  
  useEffect(() => {
    if (course && yearLevel) {
      setCourseYear(`${course}-${yearLevel}`);
    } else {
      setCourseYear('');
    }
  }, [course, yearLevel]);
  
  

  useEffect(() => {

    fetch(`${API_BASE_URL}/results`)
      .then(res => res.json())
      .then(data => {
  
        // convert Redis format to your UI format
        const votesCount = {};
  
        Object.keys(data).forEach(position => {
  
          Object.entries(data[position]).forEach(([candidate, count]) => {
  
            votesCount[`${position}_${candidate}`] = Number(count);
  
          });
  
        });
  
        setRecordedVotes({ votesCount, voteRecords: [] });
  
      });
  
  }, []);
  


  useEffect(() => {
    fetch('https://mcii-backend.onrender.com/candidates')
    .then(res => res.json())
    .then(data => setCandidates(data))
    .catch(err => console.error(err));
}, []);


  useEffect(() => {
    if (
      view === 'faceVerificationView' &&
      !isFaceConfirmed &&
      !stepsDone[`step${currentStep}`]
    ) {
      startFaceCamera();
    }
  
    return () => clearInterval(faceDetectionInterval.current);
  }, [view, currentStep, isFaceConfirmed]);

  
  useEffect(() => {
    if (view === 'faceVerificationView') {
      setCurrentStep(1);
      setStepsDone({ step1: false, step2: false, step3: false });
      setIsFaceConfirmed(false);
    }
  }, [view]);
  
  
  
  
  const startFaceCamera = async () => {
    if (!modelsLoaded) {
      console.log("Models not loaded yet");
      return;
    }
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
  
      // DO NOT LOAD MODELS HERE ANYMORE ❌
  
      faceDetectionInterval.current = setInterval(async () => {
        if (!videoRef.current) return;
  
        try {
          const detection = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 160 })
            )
            .withFaceLandmarks()
            .withFaceDescriptor();
  
          if (detection && detection.detection.score >= 0.95) {
            clearInterval(faceDetectionInterval.current);
  
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
  
            setIsFaceConfirmed(true);
          }
        } catch (err) {
          console.error("Face detection error:", err);
        }
      }, 400);
  
    } catch (err) {
      console.error("Camera error:", err);
    }
  };
  
  
  
  useEffect(() => {
    fetchCandidates();
  }, []);

    
  

  useEffect(() => {
    if (eyeBlinkDetected && !stepsDone.step1) {
      setStepsDone(prev => ({ ...prev, step1: true }));
    }
  }, [eyeBlinkDetected]);
  
  
  useEffect(() => {
    if (view === "voterInput") {  // "voterInput" is your sign-in screen
      setStudentID("");            // Clear old input
      setIsIDAlreadySignedIn(false); // Remove red warning
    }
  }, [view]);
  
  
  
  useEffect(() => {
  let stream;
  let animationId;
  let isRunning = true;
  let lastDetection = 0;

  const setupCameraAndDetect = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();
    } catch (err) {
      console.error('Camera error:', err);
      return;
    }

    const detect = async () => {
      if (!isRunning || !idFaceDescriptor) return;
    
      const now = Date.now();
      if (now - lastDetection < 300) {
        animationId = requestAnimationFrame(detect);
        return;
      }
    
      try {
        const result = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }))
          .withFaceLandmarks()
          .withFaceDescriptor();
    
        if (result) {
          const distance = faceapi.euclideanDistance(result.descriptor, idFaceDescriptor);
          console.log("Distance:", distance);
    
          if (distance < 0.45) {
            setIsFaceConfirmed(true);
            isRunning = false;
            video.srcObject.getTracks().forEach((t) => t.stop());
          }
        }
      } catch (err) {
        console.error("Face detection error:", err);
      }
    
      lastDetection = now;
      if (isRunning) animationId = requestAnimationFrame(detect);
    };
    

    detect();
  };

  if (view === 'faceVerificationView') {
    setupCameraAndDetect();
  }

  return () => {
    isRunning = false;
    cancelAnimationFrame(animationId);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  };
}, [view, idFaceDescriptor]);

useEffect(() => {
  const loadModels = async () => {
    const MODEL_URL = '/models';

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    console.log("✅ Models loaded properly");
    setModelsLoaded(true);
  };

  loadModels();
}, []);

useEffect(() => {
  if (view === 'takeIdPictureView') {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = document.querySelector('video');
      if (video) {
        video.srcObject = stream;
        setCameraStream(stream);
      }
    });
  }
}, [view]);



  
const capturePhoto = () => {
  const video = videoRef.current || document.querySelector('video');
  if (!video) {
    alert("📸 Camera not ready");
    return;
  }

  // Grab raw image directly from video
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // raw, no flipping

  const image = canvas.toDataURL('image/png');

  // ✅ Same process as upload button
  setCapturedIDPhoto(image);    // show captured photo
  startIDVerification(image);   // start verification loader

  // Stop camera if needed
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    setCameraStream(null);
  }
};


const [usingFrontCamera, setUsingFrontCamera] = useState(true);

useEffect(() => {
  async function startCamera() {
    if (!videoRef.current) return; // ✅ Ensure video exists

    // Stop any previous camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: { facingMode: usingFrontCamera ? "user" : "environment" }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream; // ✅ Only set if video still exists
      }

      setCameraStream(stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }

  startCamera();

  // Cleanup when component unmounts
  return () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
  };
}, [usingFrontCamera]); // Re-run when camera flips



  const preprocessImage = (imageDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageDataUrl;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
  
        // Draw image
        ctx.drawImage(img, 0, 0);
  
        // Grayscale filter
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
  
        resolve(canvas.toDataURL('image/png'));
      };
    });
  };
  
  const confirmIDFromImage = async (imageDataUrl) => {
    try {
      const processedImage = await preprocessImage(imageDataUrl);
  
      const { data } = await Tesseract.recognize(
        processedImage,
        'eng',
        {
          tessedit_char_whitelist:
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:-.',
          tessedit_pageseg_mode: 6,
          preserve_interword_spaces: 1,
        }
      );
  
      const rawText = data.text.toUpperCase();
      setOcrText(rawText);
  
      const text = rawText
        .replace(/[\s\n\r]+/g, ' ')
        .replace(/[.,]/g, '')
        .trim();
  
      const isValid =
        text.includes("MEDINA") &&
        text.includes("COLLEGE") &&
        text.includes("IPIL") &&
        text.includes("INC");
  
      return isValid; // ✅ TRUE or FALSE ONLY
    } catch (err) {
      console.error("OCR Error:", err);
      return false;
    }
  };
  
  const startIDVerification = async (image) => {
    setIsLoading(true);      // 🔒 LOCK SCREEN
    setIsOcrLoading(true);   // spinner text if you want
    setIsIDConfirmed(false);
  
    const isValid = await confirmIDFromImage(image);
  
    if (isValid) {
      setIsIDConfirmed(true);
      alert("✅ ID Verified");
    } else {
      alert("❌ ID not recognized. Please retake your ID photo clearly.");
    }
  
    setIsOcrLoading(false);
    setIsLoading(false);     // 🔓 UNLOCK ONLY AFTER RESULT
  };
  


  
  const handleAddDefaultCandidates = () => {
    if (!selectedPosition) {
      alert("⚠️ Please select a position first.");
      return;
    }
  
    const defaultCandidates = [
      {
        position: selectedPosition,
        name: "Candidate 1",
        courseYear: "BSCS 4",
        partylist: "Blue Partylist",
        partylistColor: "#0000FF",
        photo: `https://i.pravatar.cc/200?u=${selectedPosition}-blue` // unique placeholder
      },
      {
        position: selectedPosition,
        name: "Candidate 2",
        courseYear: "BSCS 4",
        partylist: "Red Partylist",
        partylistColor: "#FF0000",
        photo: `https://i.pravatar.cc/200?u=${selectedPosition}-red` // unique placeholder
      }
    ];
  
    setCandidates(prev => [...prev, ...defaultCandidates]);
    setSelectedPosition('');
  };
  
  
  
  
  const handleBackFromCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCapturedIDPhoto(null);
    setCameraStream(null);
    setView('verificationStep');
  };
   
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleSubmitCandidate = async () => {

  if (!selectedPosition || !candidateName || !courseYear) {
    alert("⚠️ Fill Position, Candidate Name, and Course/Year");
    return;
  }

  const candidateData = {
    position: selectedPosition,
    name: candidateName,
    courseYear,
    partylist,
    partylistColor,
    photo
  };

  try {
    const res = await fetch('https://mcii-voting-system.onrender.com/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        index: editingIndex, // ⭐ THIS ENABLES EDIT MODE
        ...candidateData
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to save candidate');
      return;
    }

    // ✅ Update UI instantly
    setCandidates(prev => {
      const updated = [...prev];

      if (editingIndex !== null && editingIndex !== undefined) {
        updated[editingIndex] = candidateData;
      } else {
        updated.push(candidateData);
      }

      return updated;
    });

    // ⭐ Reset form
    setEditingIndex(null);
    setCandidateName('');
    setCourseYear('');
    setPartylist('');
    setPartylistColor('#000000');
    setPhoto(null);

    alert(editingIndex !== null
      ? "✅ Candidate updated!"
      : "✅ Candidate added!"
    );

  } catch (err) {
    console.error(err);
    alert('Server error saving candidate');
  }
};

const handleSubmitVotes = async () => {
  if (Object.keys(selectedVotes).length !== positions.length) return;

  if (!codeUsed) return alert("❌ No code verified! Please enter your voting code.");

  try {

    // ✅ Build readable votes FIRST
    const votesPayload = Object.fromEntries(
      Object.entries(selectedVotes).map(([pos, idx]) => {
        const candidate = candidates.filter(c => c.position === pos)[idx];
        return [pos, candidate?.name || "No selection"];
      })
    );

    const res = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentID,
        name: studentName,
        code: codeUsed,
        votes: votesPayload
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Voting failed');

    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    // ✅ CREATE RECEIPT DATA HERE
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    const builtReceipt = Object.entries(votesPayload).map(
      ([position, candidate]) => ({
        position,
        candidate
      })
    );

    setReceiptData(builtReceipt); // 🔥 THIS WAS MISSING

    alert('✅ Votes submitted successfully!');

    setCodeUsed('');

    // SWITCH VIEW AFTER DATA IS READY
    setView('voteReceipt');

  } catch (err) {
    console.error(err);
    alert(`❌ Error submitting votes: ${err.message}`);
  }
};









  
  
  
  
      
  const [searchTerm, setSearchTerm] = useState('');
  
const handleDownloadCSV = () => {
  const csv = [
    ["Voter Name", "Position", "Candidate"],
    ...recordedVotes.voteRecords.flatMap(r =>
      Object.entries(r.votes).map(([pos, name]) => [r.name, pos, name])
    )
  ];
  const blob = new Blob([csv.map(row => row.join(',')).join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'voting_records.csv';
  link.click();
};

const handleDownloadPDF = () => {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write('<html><head><title>Voting Records</title></head><body>');
    win.document.write('<h1>MCII Voting Results</h1>');
    recordedVotes.voteRecords.forEach(r => {
      win.document.write(`<p><strong>${r.name}</strong> voted:</p><ul>`);
      Object.entries(r.votes).forEach(([pos, name]) => {
        win.document.write(`<li><strong>${pos}</strong>: ${name}</li>`);
      });
      win.document.write('</ul>');
    });
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  }
};

// Download printable receipt (opens a new window + print)
const downloadReceiptPDF = () => {
  if (!receiptData || receiptData.length === 0) {
    alert("No receipt to download.");
    return;
  }

  const win = window.open('', '_blank');
  if (!win) return;

  const html = `
    <html>
      <head>
        <title>MCII Voting Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { text-align: center; }
          .row { margin: 12px 0; }
          .position { font-weight: bold; }
          .candidate { margin-left: 8px; }
          .footer { margin-top: 24px; font-size: 12px; color: #666; text-align:center; }
        </style>
      </head>
      <body>
        <h1>MCII Voting Receipt</h1>
        <p><strong>Voter:</strong> ${studentName || 'Unknown'}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        ${receiptData.map(r => `<div class="row"><span class="position">${r.position}:</span><span class="candidate">${r.candidate}</span></div>`).join('')}
        <hr/>
        <div class="footer">This is an official voting receipt. Selections are final.</div>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
  // Give it a moment to render then trigger print (user can choose Save as PDF)
  setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
};

// Simple download as TXT (fallback)
const downloadReceiptTxt = () => {
  if (!receiptData || receiptData.length === 0) {
    alert("No receipt to download.");
    return;
  }
  let text = `MCII Voting Receipt\nVoter: ${studentName || 'Unknown'}\nDate: ${new Date().toLocaleString()}\n\n`;
  receiptData.forEach(r => {
    text += `${r.position}: ${r.candidate}\n`;
  });
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'voting_receipt.txt';
  a.click();
  URL.revokeObjectURL(url);
};

// Logout and reset voter-related states
const handleLogout = () => {
  // You might want to keep admin or global candidates intact; just clear voter session
  setStudentName('');
  setStudentID('');
  setSelectedVotes({});
  setHasSubmitted(false);
  setIsIDConfirmed(false);
  setIsFaceConfirmed(false);
  setPasswordInput('');
  setConfirmPasswordInput('');
  setPasswordError('');
  setReceiptData([]);
  setView('main'); // go to main screen
};


  return (
    <div className="container">
      <div className="animated-square"></div>
      {view === 'main' && (
        <div className="content">
          <div className="logo-wrapper">
  <img src="/5.png" alt="MCII Logo" className="logo" />

  <div className="vote-reminder-vertical">
    <div className="open-text"> Voting is now open! 10/15/2025</div>
    <div className="end-text">⏰ Voting ends: 6:00 PM today</div>
  </div>
</div>

<h1
  className="title"
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px'
  }}
>
  
  MCII VOTING SYSTEM
</h1>
<div className="button-group">
  

  <button className="glow-button voter" onClick={handleVoterClick}>
    VOTE NOW
  </button>
</div>

        </div>
      )}

      

      

      {view === 'takeIdPictureView' && (
  <div className="login-section">
    <h2 className="title">📸 Take ID Picture</h2>

    {!capturedIDPhoto ? (
  <>
    <div
  style={{
    width: '100%',
    maxWidth: '320px',      // ID-friendly width
    aspectRatio: '3 / 4',   // Portrait ID ratio
    borderRadius: '12px',
    overflow: 'hidden',
    border: '3px solid #4caf50',
    margin: '0 auto',
    backgroundColor: '#000',
    position: 'relative'
  }}
>
  <video
     ref={videoRef}
     autoPlay
     muted
     playsInline
     style={{
       width: '100%',
       height: '100%',
       objectFit: 'cover',
       transform: 'scaleX(1)'
    }}
  /> {/* Camera Flip Button */}
  <button
    onClick={() => setUsingFrontCamera(prev => !prev)}
    style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '35px',
      height: '35px',
      fontSize: '18px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
    }}
    title="Flip Camera"
  >
    🔄
  </button>
</div>

<button className="glow-button voter" onClick={capturePhoto}>📷 Capture</button>
    <input
  type="file"
  accept="image/*"
  style={{ display: 'none' }}
  id="upload-id-pic"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    // ✅ THIS IS WHERE you put it
    reader.onloadend = () => {
      const image = reader.result;         // get the image data
      setCapturedIDPhoto(image);           // show it immediately
      startIDVerification(image);          // start verification + loader
    };

    reader.readAsDataURL(file);

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }}
/>

    <label htmlFor="upload-id-pic" className="glow-button voter" >
      📤 Upload ID Pic (Recommended)
    </label>
  </>
  
) : (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
    {/* Left: ID image */}
    <div style={{ maxWidth: '45%' }}>
    <img
  src={capturedIDPhoto}
  alt="Captured ID"
  style={{
    width: '100%',
    borderRadius: '10px',
    transform: 'scaleX(1)' 
  }}
/>

      <p > ID Photo Captured</p>
    </div>


  </div>
)}


    <button className="glow-button admin" onClick={handleBackFromCamera}>⬅️ Back</button>
  </div>
)}

{isLoading && (
  <div className="loading-overlay">
    <div className="loading-box">
      <div className="spinner"></div>
      <p>Please wait… Verifying ID</p>
    </div>
  </div>
)}


{view === 'takeIdPictureInstruction' && (
  <div
    style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      overflow: 'hidden',
      
    }}
  >
    {/* Blurred Sign-In Form background */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        filter: 'blur(8px) brightness(0.7)',
        zIndex: 1,
        pointerEvents: 'none', // unclickable
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      
    </div>

    {/* Instruction Box */}
    <div className="login-section"
      
        
      
    >
      <h2 className="title" style={{ textAlign: 'center' }}>
        📝 Reminders
      </h2>

      
      <div >
        
          <h1 className="glow-button admin"> Remove eyeglasses, caps, or face coverings</h1>
          <h1 className="glow-button admin">Stand in good lighting</h1>
          <h1 className="glow-button admin">Be ready to blink or open your mouth </h1>
        
      </div>
      
      <div
        style={{
          marginTop: '25px',
          display: 'flex',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        <button
          className="main-button"
          onClick={() => setView('faceVerificationView')}
        >
          📸 Start Taking Face Verification
        </button>

        <button
          className="custom-button"
          onClick={() => setView('verificationStep')}
        >
          🔙 Back
        </button>
      </div>
    </div>

    <style>
      {`
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}
    </style>
  </div>
)}






{view === 'faceVerificationView' && (
  <div className=" login-section" >
    <h2 className="title">👁️ Face Verification</h2>

    {!isFaceConfirmed && (
      <h3 className="scanning-text" style={{ color: '#007bff' }}>
        Scanning<span>{dots}</span>
      </h3>
    )}

    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Camera Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          maxWidth: '400px',
          transform: 'scaleX(-1)', // Mirror view
          borderRadius: '10px',
          border: '2px solid blue',
          display: 'block'
        }}
      />
      

      {/* Step Text - absolutely positioned to the right */}
      <div
      style={{
        
        
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',     // space between steps
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#a5b9aa',
        textAlign: 'center', 
         
        whiteSpace: 'nowrap'
      }}
  > 
    {/* STEP 1 BUTTON */}
    <StepButton
  stepKey="step1"
  stepLabel="Step 1"
  title="Eye Blink Verification"
  enabled={true}
  stepsDone={stepsDone}
  setStepsDone={setStepsDone}
/>

<StepButton
  stepKey="step2"
  stepLabel="Step 2"
  title="Open Mouth Verification"
  enabled={true}
  stepsDone={stepsDone}
  setStepsDone={setStepsDone}
/>

<StepButton
  stepKey="step3"
  stepLabel="Step 3"
  title="Face Verification"
  enabled={true}
  stepsDone={stepsDone}
  setStepsDone={setStepsDone}
/>

  </div>

  <style>
{`
  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(5, 15, 100, 0.2);   /* lighter background part */
    border-top: 2px solid #007bff;        /* blue spinning part */
    border-radius: 50%;
    animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}
</style>


    </div>
    


    {showFaceVerifiedPopup && (
      <div className="popup">
        <h3 style={{ color: 'green' }}>😎✅ Face Verified!</h3>
        <button
          className=" glow-button voter"
          onClick={() => {
            setStepsDone({ step1: false, step2: false, step3: false });
            setShowFaceVerifiedPopup(false);
            stopCamera();
            setView('verificationStep'); // Go back to sign-in
          }}
        >
          OK
        </button>
      </div>
    )}

    <button
      className=" glow-button admin"
      onClick={() => {
        setStepsDone({ step1: false, step2: false, step3: false });
        clearInterval(faceDetectionInterval.current);
        stopCamera();
        setView('verificationStep');
      }}
    >
      ⬅️ Back
    </button>
  </div>
)}



{isLoading && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }}>
    <div style={{
      width: '100px',
      height: '100px',
      border: '8px solid #f3f3f3',
      borderTop: '8px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
)}


      
      {view === 'password' && (
        <div className="login-section">
          <h2 className="title">Enter Password</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: 'inline-block' }}
          />
          </div>
          <button className="glow-button voter" onClick={handleEnterClick}>Enter</button>
          <button className="glow-button voter" onClick={handleBackClick}>🡰 Back</button>
        </div>
      )}
      {view === 'voterInput' && (
  <div className="login-section">
    <h2 className="title">Voter Security</h2>

    {!showLoginForm ? (
      <>
        
        <button
          className="glow-button voter"
          onClick={() => {
            setStudentName(`${firstName} ${middleInitial}. ${lastName}`);
            setSelectedVotes({});
            setHasSubmitted(false);
            setView('code');
          }}
        >
          Sign In
        </button>
        
        <button className="glow-button admin" onClick={(handleBackClick)}>⬅️ Back</button>
      </>
    ) : (
      <div >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
        <input
          className="input-field"
          placeholder="Student ID Number"
          value={studentID}
          onChange={(e) => setStudentID(e.target.value)}
        />

        
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
</div>
<button
  className="main-button"
  style={{ marginTop: '20px' }}
  onClick={() => {
    // After verifying ID and password:
    const account = voterAccounts[studentID];
    if (!account) {
      alert('❌ Student ID not found.');
      return;
    }
    if (account.password !== passwordInput) {
      alert('❌ Incorrect password.');
      return;
    }

    // ✅ Store logged-in user info
    setStudentName(account.name); 
    setSelectedVotes({});
    setHasSubmitted(false);

    // ✅ Reset form fields
    setFirstName('');
    setMiddleInitial('');
    setLastName('');
    setCourse('');
    setYearLevel('');
    setPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordError('');
    setIsIDConfirmed(false);
    setIsFaceConfirmed(false);

    // ✅ Check if user already voted
    if (hasVotedById[studentID]) {
      setView('alreadyVotedView'); // Show receipt + download + logout
    } else {
      setView('voterWelcome'); // Normal voting flow
    }

    // Keep studentID for alreadyVotedView
    setStudentID(studentID);
  }}
>
  Log In
</button>


        <button
  className="main-button"
  onClick={() => {
    // Reset inputs and hide login form
    setStudentID('');
    setPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordError('');
    setShowLoginForm(false);
    setFirstName('');
    setMiddleInitial('');
    setLastName('');
    setCourse('');
    setYearLevel('');
    setView('voterInput');
  }}
>
  ⬅️ Back
</button>

      </div>
    )}
  </div>
)}

{view === "alreadyVotedView" && (
  <div className="content glowing-box" style={{ textAlign: "center", padding: "20px" }}>
    <h2>🎉 You Have Already Voted</h2>

    <p style={{ marginTop: "10px", marginBottom: "20px", fontSize: "18px" }}>
      <strong>Name:</strong> {studentName}
    </p>

    <h3>🧾 Your Voting Receipt</h3>

    <div
      style={{
        textAlign: 'center',
        backgroundColor: '#ffffff',  // light background
        color: '#1b1b1b',            // dark text
        padding: '25px',
        borderRadius: '12px',
        maxWidth: '700px',
        margin: '40px auto',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }}
    >
      {recordedVotes.voteRecords
        .filter((rec) => rec.name === studentName)
        .map((rec, i) => (
          <div key={i}>
            {Object.entries(rec.votes).map(([position, candidate]) => (
              <p key={position}>
                <strong>{position}:</strong> {candidate}
              </p>
            ))}
          </div>
        ))}
    </div>

    {/* Buttons: Logout + Download */}
    <div style={{ marginTop: "25px", display: "flex", justifyContent: "center", gap: "15px" }}>
      <button
       
        onClick={() => {
          setStudentID("");
          setStudentName("");
          setView("main");
        }}
      >
        .
      </button>

      <button
        className="custom-button"
        onClick={() => {
          const rec = recordedVotes.voteRecords.find(r => r.name === studentName);
          if (!rec) return;

          let text = `MCII Voting Receipt\n\nName: ${studentName}\n\nVotes:\n`;
          Object.entries(rec.votes).forEach(([pos, cand]) => {
            text += `${pos}: ${cand}\n`;
          });

          const blob = new Blob([text], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Voting_Receipt_${studentName}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        📥 Download Receipt
      </button>
    </div>
  </div>
)}


{view === "voteReceipt" && (
  <div className="content glowing-box scrollable">
    <h2 className="title">🧾 Voting Receipt</h2>

    <div style={{ marginTop: "20px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
      <p><strong>Voter:</strong> {studentName}</p>
      <p><strong>Date:</strong> {new Date().toLocaleString()}</p>

      <div>
      {receiptData?.length > 0 ? (
  receiptData.map((item, i) => (
    <div key={i} style={{ marginBottom: "12px" }}>
      <div style={{ fontWeight: "bold" }}>{item.position}</div>
      <div style={{ marginLeft: "8px" }}>{item.candidate}</div>
      <hr />
    </div>
  ))
) : (
  <p>No votes recorded.</p>
)}

      </div>
    </div>

    <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "18px" }}>
      <button
        className="main-button"
        onClick={downloadReceiptPDF}
      >
        ⬇️ Download Receipt (PDF)
      </button>

      
    </div>
  </div>
)}



{view === 'verificationStep' && (
  <div className="login-section">
    <h2 className="title">Sign in</h2>
    
    <input
      className="input-field"
      placeholder="First Name"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
    />
    <input
      className="input-field"
      placeholder="Middle Initial"
      value={middleInitial}
      onChange={(e) => setMiddleInitial(e.target.value)}
      maxLength={1}
    />
    <input
      className="input-field"
      placeholder="Last Name"
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
    />
  
  <div>
  <input
        className="input-field"
        placeholder="Student ID Number"
        value={studentID}
        onChange={(e) => {
          const value = e.target.value;

          // Allow only up to 6 digits
          if (/^\d{0,6}$/.test(value)) {
            setStudentID(value);
            // Call server to check if this ID already voted
            if (value.length === 6) checkIDOnServer(value);
            else setIsIDAlreadySignedIn(false); // reset if incomplete
          }
        }}
        style={{
          border: isIDAlreadySignedIn ? "2px solid red" : "2px solid #ccc",
          outline: "none",
        }}
        disabled={checkingID}
      />

  {/* 🔴 Warning Text */}
  {isIDAlreadySignedIn && (
        <p style={{ color: "red", marginTop: "5px", fontWeight: "bold" }}>
          ⚠️ This ID number has already voted.
        </p>
      )}

      {checkingID && (
        <p style={{ color: "gray", marginTop: "5px", fontStyle: "italic" }}>
          Checking ID...
        </p>
      )}

      <small style={{ color: "darkgray", display: "block", marginTop: "4px" }}>
        Note: Make sure your ID no. is correct
      </small>
</div>






  <select
  className="input-field"
  value={course}
  onChange={(e) => {
    setCourse(e.target.value);
    // Reset year level if MIDWIFERY and previously selected 3 or 4
    if (e.target.value === "MIDWIFERY" && (yearLevel === "3" || yearLevel === "4")) {
      setYearLevel('');
    }
  }}
>
  <option value="">-- Select Course --</option>
  <option value="BSCS">BSCS</option>
  <option value="BEED">BEED</option>
  <option value="BSHM">BSHM</option>
  <option value="BSCRIM">BSCRIM</option>
  <option value="BSPHAMA">BSPHAMA</option>
  <option value="MIDWIFERY">MIDWIFERY</option>
</select>

<select
  className="input-field"
  value={yearLevel}
  onChange={(e) => setYearLevel(e.target.value)}
>
  <option value="">-- Select Year Level --</option>
  {(course === "MIDWIFERY" ? [1, 2] : [1, 2, 3, 4]).map((year) => (
    <option key={year} value={year}>{year}</option>
  ))}
</select>

    <div>
  <small style={{ color: 'darkgray', display: 'block', marginBottom: '4px' }}>
    🔒 Note: Password must be at least 6 characters long.
  </small>
  <input
    className="input-field"
    type="password"
    placeholder="Enter Password"
    value={passwordInput}
    onChange={(e) => {
      setPasswordInput(e.target.value);
      if (confirmPasswordInput && e.target.value !== confirmPasswordInput) {
        setPasswordError('❌ Passwords do not match.');
      } else {
        setPasswordError('');
      }
    }}
    required
  />



<input
  className="input-field"
  type="password"
  placeholder="Confirm Password"
  value={confirmPasswordInput}
  onChange={(e) => {
    setConfirmPasswordInput(e.target.value);
    if (passwordInput && e.target.value !== passwordInput) {
      setPasswordError('❌ Passwords do not match.');
    } else {
      setPasswordError('');
    }
  }}
  required
/></div>

{passwordError && (
  <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{passwordError}</p>
)}



<div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
<button
  className="main-button"
  onClick={() => {
    if (!firstName || !middleInitial || !lastName || !studentID || !course || !yearLevel) {
      alert("⚠️ Finish filling up your information first.");
      return;
    }
  
    const hasID = window.confirm("Do you have MCII School ID?\n\nPress OK if YES.\nPress Cancel if NO.");
  
    if (hasID) {
      setView('takeIdPictureView');
    } else {
      const adminCode = prompt("Enter Admin Code:");
  
      if (adminCode === "qwert54321") {
        alert("✅ Admin Code Accepted!");
  
        setIsIDConfirmed(true);
        setIsFaceConfirmed(true);
  
      } else if (adminCode !== null) {
        alert("❌ Invalid Admin Code!");
      }
    }
  }}
  
  disabled={isIDConfirmed || isIDAlreadySignedIn} // disabled if ID confirmed or already signed in
  style={{
    backgroundColor: isIDConfirmed ? 'green' : '',
    cursor: isIDConfirmed || isIDAlreadySignedIn ? 'not-allowed' : 'pointer'
  }}
>
  {isIDConfirmed ? "✅ ID Confirmed" : "📸 Take ID Picture"}
</button>

<button
  className="main-button"
  onClick={() => setView('takeIdPictureInstruction')}
  disabled={!isIDConfirmed || isFaceConfirmed || isIDAlreadySignedIn} // disabled if ID not confirmed, face verified, or already signed in
  style={{
    backgroundColor: isFaceConfirmed ? 'green' : '',
    cursor: !isIDConfirmed || isFaceConfirmed || isIDAlreadySignedIn ? 'not-allowed' : 'pointer'
  }}
>
  {isFaceConfirmed ? "✅ Face Verified" : "👁️ Face Verification"}
</button>




</div>



<button
  className="glow-button voter"
  disabled={!isIDConfirmed || !isFaceConfirmed}
  style={{
    backgroundColor: isIDConfirmed && isFaceConfirmed ? '' : 'gray',
    cursor: isIDConfirmed && isFaceConfirmed ? 'pointer' : 'not-allowed'
  }}
  onClick={() => {
    if (!firstName || !middleInitial || !lastName || !studentID || !course || !yearLevel || !passwordInput || !confirmPasswordInput) {
      alert("⚠️ Please complete all fields before signing in.");
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      alert("❌ Passwords do not match.");
      return;
    }

    if (passwordInput.length < 6) {
      alert("❌ Password must be at least 6 characters.");
      return;
    }

    if (!isIDConfirmed || !isFaceConfirmed) {
      alert("❌ Please verify 📸 ID Picture and 👁️ Face Verification before signing in.");
      return;
    }

    // Save the new user
    const fullName = `${firstName} ${middleInitial}. ${lastName}`;
    setVoterAccounts(prev => ({
      ...prev,
      [studentID]: { password: passwordInput, name: fullName }
    }));

    

    setStudentName(fullName);
    setSelectedVotes({});
    setHasSubmitted(false);
    setUsedCodes(prev => new Set(prev).add(verifiedCode));
    setVerifiedCode(null);
    setView('voterWelcome');
  }}
>
  Sign In
</button>








  </div>
)}


      {view === 'voterWelcome' && (
        <div className="content scrollable">
          
         <img src="/5.png" alt="MCII Logo" className="logo" />
<h1 className="title">🎉 Welcome to MCII Voting System</h1> 
<h1 className="welcome animated-welcome">{studentName}!</h1>


<h3 className="sub">
  {course && yearLevel ? `${course} ${yearLevel}` : "--"}
</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '0px' }}>
          
        

  <button
    className="glow-button voter"
    onClick={() => setView('voteNowView')}
    style={{ fontSize: '20px', padding: '12px 24px' }}
  >
    ✍️ START VOTING
  </button>
 
          </div>

          
        </div>
      )}
      {view === 'adminMenu' && (
        <div className="login-section">
          <h1 className="title"> ADMIN PANEL</h1>
          <button className="menu-button" onClick={() => setView('viewAndAddCandidate')}>👥 View and Add Candidate</button>
          <button className="menu-button" onClick={() => setView('viewVotingResult')}>📊 View Voting Result</button>

          <button className="custom-button" onClick={handleBackClick}>🡰 Back</button>
        </div>
      )}


      
  {view === 'viewAndAddCandidate' && (
  <div className="candidate-container" style={{ textAlign: 'center', padding: '20px' }}>
    <h2 className=" title">🏫 MCII COLLEGE CANDIDATE</h2>
  

    {view === 'viewAndAddCandidate' && (
  <div
    className="candidate-container"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '30px',
      backgroundColor: '#f0f8ff', // light blue background
      borderRadius: '15px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
      maxWidth: '950px',
      margin: '20px auto'
    }}
  >

    <h3 style={{ marginBottom: '20px', fontWeight: 'normal', color: '#555' }}>📥 Add New Candidate</h3>

    {/* ===== INPUT FIELDS IN ROW ===== */}
    <div
      className="add-form"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}
    >
      <select
        value={selectedPosition}
        onChange={(e) => setSelectedPosition(e.target.value)}
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          minWidth: '200px',
          textAlign: 'center'
        }}
      >
        <option value="">-- Select Position --</option>
        {positions.map((pos, index) => (
          <option key={index} value={pos}>{pos}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Candidate Name"
        value={candidateName}
        onChange={(e) => setCandidateName(e.target.value)}
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          minWidth: '200px',
          textAlign: 'center'
        }}
      />

<select
  className="input-field"
  value={course}
  onChange={(e) => {
    const selectedCourse = e.target.value;
    setCourse(selectedCourse);

    if (selectedCourse === "MIDWIFERY" && (yearLevel === "3" || yearLevel === "4")) {
      setYearLevel('');
    }
  }}
>
  <option value="">-- Select Course --</option>
  <option value="BSCS">BSCS</option>
  <option value="BEED">BEED</option>
  <option value="BSHM">BSHM</option>
  <option value="BSCRIM">BSCRIM</option>
  <option value="BSPHAMA">BSPHAMA</option>
  <option value="MIDWIFERY">MIDWIFERY</option>
</select>
<select
  className="input-field"
  value={yearLevel}
  onChange={(e) => setYearLevel(e.target.value)}
  disabled={!course}
>
  <option value="">-- Select Year Level --</option>
  {(course === "MIDWIFERY" ? [1, 2] : [1, 2, 3, 4]).map((year) => (
    <option key={year} value={year}>
      {year}
    </option>
  ))}
</select>


      <input
        type="text"
        placeholder="Add Partylist"
        value={partylist}
        onChange={(e) => setPartylist(e.target.value)}
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          minWidth: '200px',
          textAlign: 'center'
        }}
      />
    </div>

    {/* Partylist Color Picker */}
    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
      <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Partylist Color:</label>
      <input
        type="color"
        value={partylistColor}
        onChange={(e) => setPartylistColor(e.target.value)}
        style={{
          width: '100px',
          height: '40px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '6px'
        }}
      />
    </div>

    {/* Photo Upload */}
    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
    <input
  type="file"
  accept="image/*"
  onChange={(e) => setPhoto(e.target.files[0])}
        style={{
          cursor: 'pointer',
          borderRadius: '6px',
          padding: '5px'
        }}
      />
    </div>

    {/* Buttons Row */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
    {/* Manual Submit Button */}
    <button
  onClick={() => {
    const password = prompt("Enter Password:");

    if (password === null) return; // user pressed cancel

    if (password === "access54321") {
      handleSubmitTemp(); // ✅ allow access
    } else {
      alert("❌ Incorrect Password!");
    }
  }}
  style={{
    padding: '8px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }}
>
  {editingIndex !== null ? 'Update Candidate' : 'Submit'}
</button>











      <button
        onClick={() => setView('adminMenu')}
        style={{
          padding: '8px 20px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        🡰 Back
      </button>


      

    </div>
  </div>
)}


  


{/* Candidate Display Below Form */}
<div className="candidate-list" style={{ marginTop: '40px' }}>
  {positions.map((pos, pIndex) => {

    // IMPORTANT: Keep the REAL index
    const positionCandidates = candidates
      .map((c, i) => ({ ...c, realIndex: i }))
      .filter(c => c.position === pos);

    if (positionCandidates.length === 0) return null;

    return (
      <div
        key={pIndex}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          marginBottom: '30px',
          padding: '10px',
          borderBottom: '1px solid #ccc'
        }}
      >

        {/* Position Name */}
        <div
          style={{
            minWidth: '200px',
            fontWeight: 'bold',
            fontSize: '18px',
            textTransform: 'uppercase',
            color: '#ffffff'
          }}
        >
          {pos}
        </div>

        {/* Candidates */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            flex: 1
          }}
        >
          {positionCandidates.map((candidate) => (
            <div
              key={candidate.realIndex}
              style={{
                width: '200px',
                border: '1px solid #ccc',
                borderRadius: '12px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                textAlign: 'center'
              }}
            >

              {/* Partylist */}
              {candidate.partylist && (
                <div
                  style={{
                    backgroundColor: candidate.partylistColor || '#000',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '6px 0',
                    textTransform: 'uppercase',
                    fontSize: '14px'
                  }}
                >
                  {candidate.partylist}
                </div>
              )}

              {/* Photo */}
              {candidate.photo ? (
  <img
    src={candidate.photo}   // ✅ DIRECT Supabase URL
    alt={candidate.name}
    style={{
      width: '100%',
      height: '180px',
      objectFit: 'cover'
    }}
    onError={(e) => {
      e.target.onerror = null;
       // optional fallback
    }}
  />
) : (

                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: '#ccc',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#555'
                  }}
                >
                  No Photo
                </div>
              )}

              {/* Info */}
              <div style={{ padding: '10px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {candidate.name}
                </p>

                <p style={{ margin: '2px 0' }}>
                  {candidate.courseYear}
                </p>

                {/* Buttons */}
                <button
  onClick={() => {
    const password = prompt("Enter Password:");

    if (password === null) return; // Cancel pressed

    if (password === "access54321") {
      handleEditCandidate(candidate.realIndex);
    } else {
      alert("❌ Incorrect Password!");
    }
  }}
  style={{
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
    marginRight: '5px'
  }}
>
  ✏️ Edit
</button>


<button
  onClick={() => {
    const password = prompt("Enter Password:");

    if (password === null) return; // Cancel pressed

    if (password === "access54321") {
      const confirmDelete = window.confirm("Are you sure you want to delete this candidate?");
      if (confirmDelete) {
        handleDeleteCandidate(candidate.realIndex);
      }
    } else {
      alert("❌ Incorrect Password!");
    }
  }}
  style={{
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer'
  }}
>
  🗑️ Delete
</button>


              </div>
            </div>
          ))}
        </div>
      </div>
    );
  })}
</div>


</div>
)}

    







{view === 'viewVotingResult' && (
  <div className="content scrollable glowing-box">
    <h2 className="title">📊 Voting Results</h2>

    <div style={{ marginTop: '30px', textAlign: 'center' }}>
      <button className="glow-button admin" onClick={() => setView('adminMenu')}>
        🡰 Back
      </button>
    </div>

    {Object.keys(recordedVotes.votesCount).length === 0 ? (
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        No votes have been submitted yet.
      </p>
    ) : (
      <>
        {/* Grouped Results by Position */}
        {positions.map((pos, idx) => {
          const relatedCandidates = candidates.filter(c => c.position === pos);
          if (relatedCandidates.length === 0) return null;

          const maxVotes = Math.max(
            ...relatedCandidates.map(c => recordedVotes.votesCount[`${pos}_${c.name}`] || 0)
          );

          return (
            <div className="result-section" key={idx} style={{ marginBottom: '30px' }}>
              <h3 className="section-title">{pos}</h3>

              {relatedCandidates.map((c, i) => {
                const voteKey = `${pos}_${c.name}`;
                const count = recordedVotes.votesCount[voteKey] || 0;
                const percent = maxVotes > 0 ? Math.round((count / maxVotes) * 100) : 0;
                const rankIcon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;

                return (
                  <div
                    key={i}
                    className="candidate-result-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '15px',
                      gap: '15px',
                    }}
                  >
                    {/* Candidate Card */}
                    <div
                      className="candidate-card mini"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '220px',
                        padding: '5px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                    >
                      <img
                        src={c.photo || 'https://via.placeholder.com/60.png?text=No+Photo'}
                        alt={c.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '50%',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/60.png?text=No+Photo';
                        }}
                      />
                      <div className="candidate-details">
                        <h4 style={{ margin: 0, fontSize: '14px' }}>{c.name}</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
                          {c.courseYear}
                        </p>
                      </div>
                    </div>

                    {/* Vote Result Bar */}
                    <div className="vote-bar-container" style={{ flex: 1 }}>
                      <span style={{ fontSize: '12px', color: '#333' }}>
                        <strong>{rankIcon}</strong> {count} vote(s) • {percent}%
                      </span>
                      <div
                        className="bar-container"
                        style={{
                          width: '100%',
                          height: '16px',
                          backgroundColor: '#e0e0e0',
                          borderRadius: '8px',
                          marginTop: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          className="bar-fill"
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            backgroundColor: '#4caf50',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: '5px',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 'bold',
                          }}
                        >
                          {percent > 5 && `${percent}%`}
                        </div>
                      </div>
                    </div>
                  </div>
    );
  })}
</div>

  );
})}

        {/* Voter Records */}
        <div className="result-section">
          <h3 className="section-title">🧑 Individual Voter Records</h3>
          {recordedVotes.voteRecords
  .filter(r => r.name.toLowerCase().includes(searchTerm))
  .map((record, i) => (
    <div key={i} className="voter-card">
      <p>
        <strong className="section-title">{record.name}</strong> — <em className="section-title">Code: {record.code}</em>
        <button className="mini-button" onClick={() => toggleVoterExpand(i)}>
          {expandedVoters[i] ? '➖' : '➕'}
        </button>
        <button
  className="delete-button"
  onClick={() => {
    const password = prompt("Enter Password:");

    if (password === null) return; // Cancel pressed

    if (password === "access54321") {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this voter?"
      );

      if (confirmDelete) {
        handleDeleteVoter(record.studentID);
      }
    } else {
      alert("❌ Incorrect Password!");
    }
  }}
>
  🗑️
</button>

      </p>
      {expandedVoters[i] && (
        <ul style={{ color: 'black' }} className="voter-vote-list">
          {Object.entries(record.votes).map(([pos, name], idx) => (
            <li key={idx}><strong>{pos}</strong>: {name}</li>
          ))}
        </ul>
      )}
    </div>
))}


        </div>

        {/* Download Buttons */}
        <div className="download-buttons">
          
          <button className="glow-button voter" onClick={handleDownloadPDF}>⬇️ Download PDF</button>
          <button
  className="glow-button admin"
  style={{ backgroundColor: '#e53935' }}
  onClick={async () => {

    const password = prompt("Enter Admin Password:");

    if (password === null) return; // Cancel pressed

    if (password !== "access54321") {
      alert("❌ Incorrect Password!");
      return;
    }

    const confirmReset = window.confirm(
      "⚠️ Are you sure you want to delete all votes? This cannot be undone!"
    );

    if (!confirmReset) return;

    try {
      const res = await fetch(`${API_BASE_URL}/reset-votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to reset votes");

      const codeRes = await fetch(`${API_BASE_URL}/reset-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const codeData = await codeRes.json();

      if (!codeRes.ok) throw new Error(codeData.message || "Failed to reset codes");

      alert("✅ All votes and codes have been reset successfully!");

    } catch (err) {
      console.error("Reset votes error:", err);
      alert("❌ Failed to reset votes and codes. Check console for details.");
    }
  }}
>
  🗑️ Reset All Votes & Codes
</button>


        </div>
      </>
    )}

    
  </div>
)}
    {view === 'code' && (
  <div className="login-section">
    <h2 className="title">Enter Code</h2>

    <input
  type="password"
  placeholder="Enter your code"
  className="input-field"
  value={codeEntered}
  maxLength={9}
  onChange={(e) => setCodeEntered(e.target.value.toLowerCase())}
/>


<button
  className="glow-button"
  onClick={async () => {
    if (!codeEntered) return alert('❌ Please enter a code');

    try {
      const res = await fetch(`${API_BASE_URL}/check-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeEntered }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ ${data.message}`);
        setCodeEntered('');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);

        if (data.type === 'admin') {
          setView('adminMenu');
        } else if (data.type === 'voter') {
          setView('verificationStep');
          setCodeUsed(codeEntered);
        }

        setCodeEntered('');
      }, 1000);

    } catch (err) {
      console.error(err);
      alert('❌ Server error. Please try again.');
      setCodeEntered('');
    }
  }}
>
  Enter
</button>






    <button className="glow-button voter" onClick={handleBackClick}>
      🡰 Back
    </button>
  </div>
)}

{view === 'voteNowView' && (
  <div className="content scrollable glowing-box">
    <h2 className="title">🗳️ Select Your Candidate</h2>

    {hasVotedById[studentID] ? (
      <div className="thank-you">
        <h3>✅ Done Voting</h3>
        <p>Thanks for voting, <strong>{studentName}</strong>!</p>
        <button className="glow-button admin" onClick={() => setView('voterWelcome')}>
          Back
        </button>
      </div>
    ) : (
      <>
        <div className="position-candidate-container">
          {positions.map((position, idx) => {
            const related = candidates.filter(c => c.position === position);
            const selIdx = selectedVotes[position];

            return (
              <div key={idx} className="position-candidate-row">
                <div className="position-name">
                  <h3>{position}</h3>
                </div>

                <div className="cards-wrapper">
                  {related.length === 0 ? (
                    <i>No candidate yet</i>
                  ) : (
                    related.map((c, i) => {
                      const isSelected = selIdx === i;
                      const isBlur = selIdx !== undefined && !isSelected;

                      return (
                        <div
                          key={i}
                          className={`candidate-card ${isBlur ? 'blurred' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() =>
                            selIdx === undefined &&
                            setSelectedVotes({ ...selectedVotes, [position]: i })
                          }
                          style={{ cursor: selIdx === undefined ? 'pointer' : 'default' }}
                        >
                          {c.partylist && (
                            <div
                              style={{
                                backgroundColor: c.partylistColor || '#000',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: '10px 0',
                                textTransform: 'uppercase',
                                fontSize: '12px',
                                borderRadius: '5px',
                              }}
                            >
                              {c.partylist}
                            </div>
                          )}

                          {/* Candidate Photo */}
                          <img
                            src={
                              c.photo
                                ? c.photo // use Supabase public URL
                                : 'https://via.placeholder.com/200x180.png?text=No+Photo'
                            }
                            alt={c.name}
                            className="candidate-photo"
                            style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '5px' }}
                            onError={e => {
                             
                            }}
                          />

                          {/* Candidate Info */}
                          <div className="candidate-details">
                            <h4>{c.name}</h4>
                            <p>{c.courseYear}</p>
                            {isSelected && (
                              <button
                                className="cancel-button"
                                onClick={e => {
                                  e.stopPropagation();
                                  const nv = { ...selectedVotes };
                                  delete nv[position];
                                  setSelectedVotes(nv);
                                }}
                              >
                                ❌ Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="action-buttons">
          <button
            className="glow-button voter"
            onClick={handleSubmitVotes}
            disabled={Object.keys(selectedVotes).length !== positions.length}
          >
            Submit
          </button>
        </div>
      </>
    )}
  </div>
)}

    </div>
  );
}
export default App;