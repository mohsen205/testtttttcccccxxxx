const { db, axios } = require("../utils/admin");
const { config } = require("../config/config");

// login admin function
exports.adminLogin = async (request, response) => {
  try {
    const credentials = {
      email: request.body.email,
      password: request.body.password,
    };

    const res = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.API_KEY}`,
      {
        email: credentials.email,
        password: credentials.password,
        returnSecureToken: true,
      }
    );
    delete res.data.kind;
    delete res.data.registered;

    const uid = res.data.localId;
    const userDetailsRef = db.collection("usersDetails");
    const querySnapshot = await userDetailsRef.where("uid", "==", uid).get();

    let isAdmin = false;
    querySnapshot.forEach((doc) => {
      if (doc.data().role === "admin") {
        isAdmin = true;
      }
      res.data.photoUrl = doc.data().photoUrl;
      res.data.firstName = doc.data().firstName;
      res.data.lastName = doc.data().lastName;
    });

    if (!isAdmin) {
      response.status(401).json({ message: "UNAUTHORIZED_OPERATION" });
    } else {
      response.status(201).json(res.data);
    }
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

// sign for user (FIX IT)
exports.userLogin = (request, response) => {
  const credential = {
    identifier: request.body.identifier,
    password: request.body.password,
  };

  axios
    .post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.API_KEY}`,
      {
        email: credential.identifier,
        password: credential.password,
        returnSecureToken: true,
      }
    )
    .then((res) => {
      const data = {};
      const id = res.data.localId;
      data.uid = id;
      data.idToken = res.data.idToken;
      data.fullName = res.data.displayName;
      data.expiresIn = res.data.expiresIn;
      data.role = res.data.role;

      const userDetailsRef = db.collection("userDetails");
      userDetailsRef
        .where("uid", "==", id)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            data.isFirstTimeLogin = doc.data().isFirstTimeLogin;
            data.role = doc.data().role;
            response.status(201).json(data);
          });
        })
        .catch((error) => {
          if (error.response) {
            return response
              .status(error.response.data.error.code)
              .json({ error: error.response.data.error.message });
          } else {
            return response.status(500).json({ error: error.message });
          }
        });
    })
    .catch((error) => {
      if (error.response) {
        return response
          .status(error.response.data.error.code)
          .json({ error: error.response.data.error.message });
      } else {
        return response.status(500).json({ error: error.message });
      }
    });
};

// -------------------------------------------- Finish Them ------------------------------------------------------------------------------
// get single user
exports.getUserData = (request, response) => {
  axios
    .post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${config.API_KEY}`,
      {
        idToken: request.body.token,
      }
    )
    .then((res) => {
      const data = res.data;
      const responseData = {};
      const id = data.users[0].localId;
      responseData.email = data.users[0].email;
      responseData.displayName = data.users[0].displayName;
      responseData.phoneNumber = data.users[0].phoneNumber;
      responseData.photoUrl = data.users[0].photoUrl;

      const userDetailsRef = db.collection("userDetails");
      userDetailsRef
        .where("uid", "==", id)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            responseData.firstName = doc.data().firstName;
            responseData.lastName = doc.data().lastName;
            responseData.jobTitle = doc.data().jobTitle;
            response.status(200).json(responseData);
          });
        })
        .catch((error) => {
          if (error.response) {
            return response
              .status(error.response.data.error.code)
              .json({ error: error.response.data.error.message });
          } else {
            return response.status(500).json({ error: error.message });
          }
        });
    })
    .catch((error) => {
      if (error.response) {
        console.log({ error: error.response.data.error.message });
        return response
          .status(error.response.data.error.code)
          .json({ error: error.response.data.error.message });
      } else {
        return response.status(500).json({ error: error.message });
      }
    });
};

// user first time update password change the secruty issues (finished)
exports.initialChangePassword = (request, response) => {
  console.log({
    idToken: request.body.token,
    password: request.body.password,
  });

  axios
    .post(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${config.API_KEY}`,
      {
        idToken: request.body.token,
        password: request.body.password,
        returnSecureToken: true,
      }
    )
    .then((res) => {
      const data = {};
      const id = res.data.localId;
      data.uid = id;
      data.idToken = res.data.idToken;
      data.fullName = res.data.displayName;
      data.expiresIn = res.data.expiresIn;
      data.isFirstTimeLogin = false;
      const userDetailsRef = db.collection("userDetails");
      const userQuery = userDetailsRef.where("uid", "==", id);
      userQuery
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userId = userDoc.id;
            userDetailsRef
              .doc(userId)
              .update({
                isFirstTimeLogin: false,
              })
              .then(() => {
                return response.status(200).json(data);
              })
              .catch((error) => {
                if (error.response) {
                  return response
                    .status(error.response.data.error.code)
                    .json({ error: error.response.data.error.message });
                } else {
                  return response.status(500).json({ error: error.message });
                }
              });
          } else {
            return response.status(404).json({ error: "Worker is not found" });
          }
        })
        .catch((error) => {
          if (error.response) {
            return response
              .status(error.response.data.error.code)
              .json({ error: error.response.data.error.message });
          } else {
            return response.status(500).json({ error: error.message });
          }
        });
    })
    .catch((error) => {
      if (error.response) {
        console.log({ error: error.response.data.error.message });
        return response
          .status(error.response.data.error.code)
          .json({ error: error.response.data.error.message });
      } else {
        return response.status(500).json({ error: error.message });
      }
    });
};
