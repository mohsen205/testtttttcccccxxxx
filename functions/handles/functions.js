const { db } = require("../utils/admin");

// create function
const createFunctionsData = async (request, response) => {
  try {
    const functionName = request.body.functionName;
    const functionRef = db
      .collection("functions")
      .where("functionName", "==", functionName);
    const functionSnapshot = await functionRef.get();
    if (!functionSnapshot.empty) {
      response
        .status(409)
        .json({ error: `Function name '${functionName}' already exists.` });
      return;
    }
    const data = {
      functionName: functionName,
      comment: request.body.comment || null,
      //admin.firestore.FieldValue.serverTimestamp(),  Use server timestamp for createdAt when it deploy it
      createdAt: new Date(),
      updatedAt: null,
    };
    await db.collection("functions").add(data);
    response
      .status(201)
      .json({ message: "The function has been successfully added." });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updateFunctionData = async (request, response) => {
  try {
    const functionId = request.params.id;
    // Get the function document by ID
    const functionDoc = await db.collection("functions").doc(functionId).get();
    const id = functionDoc.id;
    // Check if the function document exists
    if (!functionDoc.exists) {
      response
        .status(404)
        .json({ error: `Function with ID ${functionId} not found.` });
      return;
    }

    const functionName = request.body.functionName;
    const comment = request.body.comment || null;
    const updatedAt = new Date();

    // finish them wnat y our deploy
    const functionRef = db
      .collection("functions")
      .where("functionName", "==", functionName);
    // .where(admin.firestore.FieldPath.documentId(), "!=", functionId); add it when deploy
    const functionSnapshot = await functionRef.get();
    if (!functionSnapshot.empty) {
      response.status(409).json({
        error: `Function name '${functionName}' already exists.`,
      });
      return;
    }

    await db.collection("functions").doc(functionId).update({
      functionName,
      comment,
      updatedAt,
    });

    response.status(200).json({ message: "The function has been updated." });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const deleteFunctionData = async (request, response) => {
  try {
    const functionId = request.params.id;

    // Get the function document by ID
    const functionDoc = await db.collection("functions").doc(functionId).get();

    if (!functionDoc.exists) {
      response
        .status(404)
        .json({ error: `Function with ID ${functionId} not found.` });
      return;
    }

    await db.collection("functions").doc(functionId).delete();

    response.status(200).json({ message: "The function has been deleted." });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const getFunctionData = async (request, response) => {
  try {
    const functionId = request.params.id;

    // Get the function document by ID
    const functionDoc = await db.collection("functions").doc(functionId).get();

    // Check if the function document exists
    if (!functionDoc.exists) {
      response
        .status(404)
        .json({ error: `Function with ID ${functionId} not found.` });
      return;
    }

    // Extract the function data
    const functionData = functionDoc.data();

    response.status(200).json(functionData);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const getFunctionsData = async (request, response) => {
  try {
    const functionsRef = db
      .collection("functions")
      .orderBy("createdAt", "desc");
    const functionsSnapshot = await functionsRef.get();
    const functionsData = functionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    response.status(200).json(functionsData);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFunctionsData,
  updateFunctionData,
  deleteFunctionData,
  getFunctionData,
  getFunctionsData,
};
