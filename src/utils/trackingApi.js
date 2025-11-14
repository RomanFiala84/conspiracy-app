/**
 * Odošle tracking dáta na Netlify Function
 * @param {object} trackingData - Kompletné tracking dáta
 * @returns {Promise<object>} - Server response
 */
export const sendTrackingData = async (trackingData) => {
  try {
    const response = await fetch('/api/save-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Tracking data saved:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send tracking data:', error);
    throw error;
  }
};

/**
 * Získa tracking dáta z Netlify Function
 * @param {object} filters - Filter parametre
 * @returns {Promise<object>} - Tracking dáta
 */
export const fetchTrackingData = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/get-tracking?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Failed to fetch tracking data:', error);
    throw error;
  }
};
