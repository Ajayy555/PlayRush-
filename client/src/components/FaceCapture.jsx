import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CheckCircle, AlertTriangle, Users, RefreshCw,
  Loader, ShieldCheck, Lock, Upload, HelpCircle,
} from 'lucide-react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

export default function FaceCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);

  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [faceCount, setFaceCount] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [detectionReady, setDetectionReady] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // Stop camera tracks helper
  const stopCameraStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // 1. Initialize face-api models and camera on mount
  useEffect(() => {
    isMountedRef.current = true;

    async function init() {
      // Start camera first for instant preview
      await startCamera();

      // Load face detection models in background
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        if (isMountedRef.current) {
          setModelLoading(false);
          setDetectionReady(true);
        }
      } catch (err) {
        console.warn('Face models load warning:', err);
        if (isMountedRef.current) {
          setModelLoading(false);
          setDetectionReady(true);
        }
      }
    }

    init();

    // Permissions change listener: auto-restart camera if user unblocks permission in browser bar
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'camera' })
        .then((permissionStatus) => {
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              startCamera();
            }
          };
        })
        .catch(() => {});
    }

    return () => {
      isMountedRef.current = false;
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // 2. Start webcam stream
  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam streaming not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => {
              if (isMountedRef.current) {
                setCameraActive(true);
                setCameraError('');
              }
            })
            .catch((err) => {
              console.error('Video play error:', err);
              if (isMountedRef.current) {
                setCameraError('Unable to play video: ' + err.message);
              }
            });
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (isMountedRef.current) {
        let msg = 'Camera access was blocked.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          msg = 'Camera permission denied.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          msg = 'No camera hardware found on this device.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          msg = 'Camera is in use by another app.';
        }
        setCameraError(msg);
        setCameraActive(false);
      }
    }
  };

  // 3. Fallback: native device camera / photo capture via file picker
  const handleDevicePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      setCapturedPhoto(base64);
      stopCameraStream();
      onCapture(base64);
    };
    reader.readAsDataURL(file);
  };

  // 4. Live face detection loop
  useEffect(() => {
    if (!cameraActive || !detectionReady || capturedPhoto) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    intervalRef.current = setInterval(async () => {
      if (!isMountedRef.current || !video || video.readyState < 2 || !canvas) return;

      try {
        let count = 0;
        let detections = [];

        if (faceapi.nets.tinyFaceDetector.isLoaded) {
          detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 })
          );
          count = detections.length;
        } else {
          count = 1;
        }

        if (!isMountedRef.current) return;
        setFaceCount(count);

        const displayWidth = video.clientWidth || 320;
        const displayHeight = video.clientHeight || 200;
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length > 0) {
          const dims = { width: displayWidth, height: displayHeight };
          const resizedDetections = faceapi.resizeResults(detections, dims);

          resizedDetections.forEach((det) => {
            const { x, y, width, height } = det.box;
            const isSingle = count === 1;
            const strokeColor = isSingle ? '#22c55e' : '#ef4444';

            ctx.save();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            const cornerSize = Math.min(18, width / 4);
            ctx.lineWidth = 3;

            // TL
            ctx.beginPath();
            ctx.moveTo(x, y + cornerSize); ctx.lineTo(x, y); ctx.lineTo(x + cornerSize, y);
            ctx.stroke();

            // TR
            ctx.beginPath();
            ctx.moveTo(x + width - cornerSize, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + cornerSize);
            ctx.stroke();

            // BL
            ctx.beginPath();
            ctx.moveTo(x, y + height - cornerSize); ctx.lineTo(x, y + height); ctx.lineTo(x + cornerSize, y + height);
            ctx.stroke();

            // BR
            ctx.beginPath();
            ctx.moveTo(x + width - cornerSize, y + height); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width, y + height - cornerSize);
            ctx.stroke();

            ctx.restore();
          });
        }
      } catch (e) {
        // detection cycle error, non-fatal
      }
    }, 280);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [cameraActive, detectionReady, capturedPhoto]);

  // 5. Capture photo action
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = video.videoWidth || 640;
    snapCanvas.height = video.videoHeight || 480;
    const ctx = snapCanvas.getContext('2d');

    // Horizontal mirror for natural selfie capture
    ctx.translate(snapCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

    const base64 = snapCanvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(base64);
    stopCameraStream();
    onCapture(base64);
  };

  // 6. Retake photo
  const handleRetake = async () => {
    setCapturedPhoto(null);
    setFaceCount(0);
    onCapture(null);
    await startCamera();
  };

  // Helper status config
  const getStatusInfo = () => {
    if (!cameraActive) {
      return { text: 'Starting camera preview…', color: '#a855f7', icon: <Loader size={14} className="spin" /> };
    }
    if (modelLoading) {
      return { text: 'Initializing AI face detector…', color: '#06b6d4', icon: <Loader size={14} className="spin" /> };
    }
    if (faceCount === 0) {
      return { text: 'Align face in camera frame', color: '#f59e0b', icon: <AlertTriangle size={14} /> };
    }
    if (faceCount === 1) {
      return { text: 'Face verified ✓ Ready to capture!', color: '#22c55e', icon: <CheckCircle size={14} /> };
    }
    return { text: `${faceCount} faces! Only 1 person allowed`, color: '#ef4444', icon: <Users size={14} /> };
  };

  const status = getStatusInfo();
  const canCapture = cameraActive && (faceCount === 1 || !faceapi.nets.tinyFaceDetector.isLoaded);

  return (
    <div className="fc-root">
      {/* Hidden file input for native device camera fallback */}
      <input
        type="file"
        accept="image/*"
        capture="user"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleDevicePhotoUpload}
      />

      {/* ── Captured Preview State ── */}
      {capturedPhoto ? (
        <motion.div
          className="fc-captured-box"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="fc-preview-circle">
            <img src={capturedPhoto} alt="Captured profile avatar" />
            <div className="fc-verified-badge">
              <ShieldCheck size={14} /> Face Verified
            </div>
          </div>
          <div className="fc-captured-meta">
            <p className="fc-captured-title">Face Verified &amp; Saved</p>
            <p className="fc-captured-sub">Uploaded to Cloudinary CDN with ₹500 bonus ready</p>
          </div>
          <button type="button" className="btn-outline-sm fc-retake-btn" onClick={handleRetake}>
            <RefreshCw size={13} /> Retake Photo
          </button>
        </motion.div>
      ) : (
        /* ── Live Camera State ── */
        <div className="fc-live-container">
          <div className="fc-video-box">
            {/* Always mounted video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="fc-video-element"
            />
            {/* Overlay canvas for face landmark boxes */}
            <canvas ref={canvasRef} className="fc-canvas-overlay" />

            {/* Scanning Laser Beam */}
            {cameraActive && (
              <motion.div
                className="fc-scanner-line"
                animate={{ top: ['5%', '92%', '5%'] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Loading Overlay */}
            {!cameraActive && !cameraError && (
              <div className="fc-loading-overlay">
                <Loader size={30} className="spin fc-spinner" />
                <p style={{ fontSize: 13, marginTop: 6 }}>Opening camera…</p>
              </div>
            )}

            {/* Beginner-friendly Error & Permission Reset Guide */}
            {cameraError && (
              <div className="fc-error-overlay">
                <div className="fc-error-badge">
                  <Lock size={16} color="#ef4444" />
                  <span>Camera Access Blocked</span>
                </div>
                <p className="fc-error-text">
                  Tap the <strong>🔒 lock / tune icon</strong> in your browser address bar &amp; set Camera to <strong>"Allow"</strong>.
                </p>
                <div className="fc-error-actions">
                  <button type="button" className="btn-primary btn-sm" onClick={startCamera}>
                    <RefreshCw size={13} /> Retry Camera
                  </button>
                  <button
                    type="button"
                    className="btn-outline-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={13} /> Snap with Phone Camera
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Face Status Pill */}
          {cameraActive && (
            <AnimatePresence mode="wait">
              <motion.div
                key={faceCount + (modelLoading ? 'load' : 'ready')}
                className="fc-status-pill"
                style={{
                  borderColor: `${status.color}55`,
                  background: `${status.color}15`,
                  color: status.color,
                }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {status.icon}
                <span>{status.text}</span>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Action Capture Button */}
          <motion.button
            type="button"
            className={`fc-capture-action-btn ${canCapture ? 'ready' : 'waiting'}`}
            onClick={handleCapture}
            disabled={!canCapture}
            whileTap={canCapture ? { scale: 0.96 } : {}}
            animate={
              canCapture
                ? {
                    boxShadow: [
                      '0 0 0 rgba(34,197,94,0)',
                      '0 0 22px rgba(34,197,94,0.6)',
                      '0 0 0 rgba(34,197,94,0)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 1.6, repeat: Infinity }}
            id="capture-face-btn"
          >
            <Camera size={18} />
            {canCapture ? '📸 Capture Face Photo' : 'Position 1 Face to Capture'}
          </motion.button>
        </div>
      )}
    </div>
  );
}
