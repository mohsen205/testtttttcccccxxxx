const { admin, db } = require("../utils/admin");
const {
  generatePassword,
  getFileNameFromStorageUrl,
} = require("../utils/utils");

const auth = admin.auth();
const { sendEmail, sendEmailPassowrdHtmlBody } = require("../utils/email");
const { uploadImage, deleteImage, updateImage } = require("../utils/files");
const formidable = require("formidable-serverless");

// create user
const createUser = async (request, response) => {
  try {
    const imageUrl = await uploadImage(request);

    const form = new formidable.IncomingForm();
    const fieldsPromise = new Promise((resolve, reject) => {
      form.parse(request, (error, fields, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(fields);
        }
      });
    });

    const fields = await fieldsPromise;

    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      functionId,
      role = "worker",
      address,
      birthdayDate,
      comment,
    } = fields;

    const displayName = `${firstName} ${lastName}`;
    const password = generatePassword();

    const { uid } = await auth.createUser({
      email,
      phoneNumber,
      photoURL: imageUrl,
      displayName,
      password,
    });

    await db.collection("usersDetails").add({
      uid,
      email,
      phoneNumber,
      photoURL: imageUrl,
      functionId,
      role,
      isFirstTimeLogin: true,
      firstName,
      lastName,
      address,
      birthdayDate,
      comment,
      registrationNumber: `BS-${uid}`,
      createdAt: new Date(),
      updatedAt: null,
    });

    sendEmail({
      recipient: email,
      subject: "Vos informations de connexion",
      htmlBody: sendEmailPassowrdHtmlBody(email, password),
    });

    response.json({ message: "User created successfully" });
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

// update user
const updateUserData = async (request, response) => {
  try {
    const docId = request.params.id;

    const userDoc = await db.collection("usersDetails").doc(docId).get();

    if (!userDoc.exists) {
      return response.status(404).json({ error: "User not found" });
    }

    const imageUrl = await updateImage(
      getFileNameFromStorageUrl(userDoc.data().photoURL),
      request
    );

    const form = new formidable.IncomingForm();
    const fieldsPromise = new Promise((resolve, reject) => {
      form.parse(request, (error, fields, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(fields);
        }
      });
    });

    const fields = await fieldsPromise;

    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      functionId,
      role = "worker",
      address,
      codePostal,
      birthdayDate,
      comment,
      registrationNumber,
    } = fields;

    const displayName = `${firstName} ${lastName}`;

    const userUpdateData = {
      email,
      phoneNumber,
      photoURL: imageUrl,
      displayName,
      functionId,
      role,
      firstName,
      lastName,
      address,
      birthdayDate,
      codePostal,
      comment,
      registrationNumber,
      updatedAt: new Date(),
    };

    await auth.updateUser(userDoc.data().uid, userUpdateData);
    await db.collection("usersDetails").doc(docId).update(userUpdateData);

    response.json({ message: "User updated successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// delete user
const deleteUserData = async (request, response) => {
  try {
    const docId = request.params.id;

    const userDoc = await db.collection("usersDetails").doc(docId).get();

    if (!userDoc.exists) {
      return response.status(404).json({ error: "User not found" });
    }

    const imagePath = userDoc.data().photoURL;
    const imageName = getFileNameFromStorageUrl(imagePath);
    await auth.deleteUser(userDoc.data().uid);
    await db.collection("usersDetails").doc(docId).delete();
    deleteImage(imageName);

    response.json({ message: "User deleted successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// get single user
const getUserData = async (request, response) => {
  try {
    const userId = request.params.id;

    const userDoc = await db.collection("usersDetails").doc(userId).get();

    if (!userDoc.exists) {
      response.status(404).json({ error: `User with ID ${userId} not found.` });
      return;
    }

    const userData = userDoc.data();
    delete userData.uid;
    response.status(200).json({ userData });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// get all users data
const getUsersData = async (request, response) => {
  try {
    const usersRef = db
      .collection("usersDetails")
      .where("role", "!=", "admin")
      .orderBy("role", "asc")
      .orderBy("createdAt", "desc");

    const usersSnapshot = await usersRef.get();
    const usersData = usersSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    usersData.map((userData) => delete userData.uid);
    response.status(200).json(usersData);
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

module.exports = {
  createUser,
  updateUserData,
  deleteUserData,
  getUserData,
  getUsersData,
};
