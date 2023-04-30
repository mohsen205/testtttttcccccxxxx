const { db } = require("../utils/admin");
const { mapShiftDataWithClientNames } = require("../utils/utils");

// create shift
const createShift = async (request, response) => {
  try {
    const { clientId, date, startTime, endTime, shiftType, requestedPosition } =
      request.body;
    const data = {
      clientId,
      date,
      startTime,
      endTime,
      shiftType,
      requestedPosition,
      createdAt: new Date(),
      updatedAt: null,
    };

    const docRef = await db.collection("shifts").add(data);
    const newShift = await docRef.get();
    const responseData = {
      id: newShift.id,
      ...newShift.data(),
    };

    response.status(200).json({
      message: "The Shift has been successfully added.",
      data: responseData,
    });
  } catch (error) {
    if (error.response) {
      response
        .status(error.response.data.error.code)
        .json({ error: error.response.data.error.message });
    } else {
      response.status(500).json({ error: error.message });
    }
  }
};

// update shift
const updateShiftData = async (request, response) => {
  try {
    const shiftId = request.params.id;
    const shiftData = request.body;

    const shiftRef = db.collection("shifts").doc(shiftId);
    const doc = await shiftRef.get();

    if (!doc.exists) {
      return response.status(404).json({ error: "Shift not found." });
    }

    await shiftRef.update({
      ...shiftData,
      updatedAt: new Date(),
    });

    response
      .status(200)
      .json({ message: "The shift has been update with success" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// delete shift
const deleteShiftData = async (request, response) => {
  try {
    const shiftId = request.params.id;

    const shiftRef = db.collection("shifts").doc(shiftId);
    const doc = await shiftRef.get();

    if (!doc.exists) {
      return response.status(404).json({ error: "Shift not found." });
    }

    await shiftRef.delete();

    response.status(200).json({ message: "Shift deleted successfully." });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// get shift
const getShiftData = async (request, response) => {
  try {
    const shiftId = request.params.id;

    const shiftRef = db.collection("shifts").doc(shiftId);
    const doc = await shiftRef.get();

    if (!doc.exists) {
      return response.status(404).json({ error: "Shift not found." });
    }

    const shiftData = {
      id: doc.id,
      ...doc.data(),
    };

    response.status(200).json({ data: shiftData });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// get all shifts
const getShiftsData = async (request, response) => {
  try {
    const shiftRef = db.collection("shifts").orderBy("createdAt", "desc");
    const clientSnapshot = await db.collection("clients").get();
    const clientsData = clientSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const shiftsSnapshot = await shiftRef.get();

    const shiftsData = shiftsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const data = mapShiftDataWithClientNames(shiftsData, clientsData);
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = {
  createShift,
  updateShiftData,
  deleteShiftData,
  getShiftData,
  getShiftsData,
};
