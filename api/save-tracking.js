// api/save-tracking.js
// OPRAVENÁ VERZIA - Ukladá landmarks do MongoDB

import { connectToDatabase } from './utils/dbConnect';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const trackingData = req.body;

    // Validácia
    if (!trackingData.userId || !trackingData.contentId || !trackingData.contentType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Pripoj sa k MongoDB
    const { db } = await connectToDatabase();

    // Analyzuj mouse movement
    const movementAnalysis = analyzeMouseMovement(trackingData.mousePositions || []);

    // ✅ OPRAVA - Pridaj landmarks field
    const trackingRecord = {
      userId: trackingData.userId,
      contentId: trackingData.contentId,
      contentType: trackingData.contentType,
      timestamp: new Date(),
      hoverMetrics: {
        totalHoverTime: trackingData.totalHoverTime || 0,
        hoverStartTime: trackingData.hoverStartTime,
      },
      mousePositions: trackingData.mousePositions || [],
      movementAnalysis,
      cloudinaryData: null, // Bude aktualizované neskôr
      containerDimensions: trackingData.containerDimensions || {},
      landmarks: trackingData.landmarks || [], // ✅ PRIDANÉ
      isMobile: trackingData.isMobile || false,
    };

    // Ulož do MongoDB
    const result = await db.collection('hover_tracking').insertOne(trackingRecord);

    console.log('✅ Tracking data saved:', {
      trackingId: result.insertedId.toString(),
      userId: trackingData.userId,
      contentId: trackingData.contentId,
      mousePositions: trackingData.mousePositions?.length || 0,
      landmarks: trackingData.landmarks?.length || 0 // ✅ Log landmarks
    });

    return res.status(200).json({
      success: true,
      trackingId: result.insertedId.toString(),
      message: 'Tracking data saved successfully'
    });

  } catch (error) {
    console.error('❌ Save tracking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Helper funkcia - analyzuj mouse movement
function analyzeMouseMovement(positions) {
  if (!positions || positions.length === 0) {
    return {
      totalDistance: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      directionChanges: 0,
    };
  }

  let totalDistance = 0;
  let maxSpeed = 0;
  let directionChanges = 0;
  let prevDirection = null;

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    totalDistance += distance;
    
    const timeDiff = (curr.timestamp - prev.timestamp) / 1000;
    if (timeDiff > 0) {
      const speed = distance / timeDiff;
      maxSpeed = Math.max(maxSpeed, speed);
    }
    
    const direction = Math.atan2(dy, dx);
    if (prevDirection !== null) {
      const angleDiff = Math.abs(direction - prevDirection);
      if (angleDiff > Math.PI / 4) {
        directionChanges++;
      }
    }
    prevDirection = direction;
  }

  const totalTime = (positions[positions.length - 1].timestamp - positions[0].timestamp) / 1000;
  const averageSpeed = totalTime > 0 ? totalDistance / totalTime : 0;

  return {
    totalDistance: Math.round(totalDistance),
    averageSpeed: Math.round(averageSpeed),
    maxSpeed: Math.round(maxSpeed),
    directionChanges,
    positionsCount: positions.length,
  };
}
