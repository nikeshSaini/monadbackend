
// function setUser(user){
//     try {
//         console.log("try block");
//         const token = jwt.sign({
//             _id: user._id,
//             email: user.email,
//         }, secret, { expiresIn: '1h' });

//         console.log("Generated token:", token); // Add logging
//         return token;
//     } catch (error) {
//         console.error("Error generating token:", error); // Add error logging
//         return null;
//     }
// }





module.exports ={setUser,getUser}