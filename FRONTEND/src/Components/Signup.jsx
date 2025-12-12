// import { Button, TextField, Typography } from "@mui/material";
// import Box from "@mui/material/Box";
// import axios from "axios";
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Signup = () => {
//   var [input, setInput] = useState({});
//   var baseurl = import.meta.env.VITE_API_BASE_URL;
//   var navigate=useNavigate();
//   const inpuHandler = (e) => {
//     // console.log(e.target.value);
//     setInput({ ...input, [e.target.name]: e.target.value });
//     console.log(input);
//   };
//   const addhandler = () => {
//     console.log("Clicked");
//     axios
//       .post(`${baseurl}/api`, input)
//       .then((res) => {
//         console.log(res);
//         alert(res.data.message);
//         navigate('/L')
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   return (
    
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f7fa' }}>
//   <Box
//     sx={{
//       width: 400,
//       padding: 4,
//       backgroundColor: "#ffffff",                                             
//       borderRadius: 4,
//       marginTop: 5,
//       boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
//     }}
//   >
//     <Typography variant="h3" gutterBottom align="center" sx={{ fontFamily:"italian",fontWeight: 400, color: "purple" }}>
//     CAMPUS CASH
//     </Typography>
//     <Typography variant="h5" gutterBottom align="center" sx={{ color: "#555",fontFamily:"italian" }}>
//       Signup Form
//     </Typography>

//     <TextField
//       fullWidth
//       label="Fullname"
//       variant="outlined"
//       margin="normal"
//       name="fname"
//       onChange={inpuHandler}
//     />

//     <TextField
//       fullWidth
//       label="Email"
//       variant="outlined"
//       margin="normal"
//       name="ename"
//       onChange={inpuHandler}
//     />

//     <TextField
//       fullWidth
//       label="Password"
//       variant="outlined"
//       margin="normal"
//       name="password"
//       onChange={inpuHandler}
//       type="password"
//     />

//     <Button
  
//       onClick={addhandler}
//       fullWidth
//       variant="contained"
//       sx={{
//         marginTop: 2,
//         backgroundColor: "purple",
//         "&:hover": {
//           backgroundColor: "purple",
//         },
//         fontWeight: 400,
//         fontFamily:"italian"
//       }}
//     >
//       Sign Up
//     </Button>

//     <Typography variant="h6" align="center" sx={{ color: "text.secondary", marginTop: 3 }}>
//       Already a user? <Link to="/L" style={{ fontFamily:"italian",color: "purple", textDecoration: 'none', fontWeight: 500 }}>Login</Link>
//     </Typography>
//   </Box>
// </div>
//   );
// };

// export default Signup;

import {
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import Box from "@mui/material/Box";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [input, setInput] = useState({
    termsAccepted: false,
  });

  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const inputHandler = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setInput({ ...input, [e.target.name]: value });
  };

  const addHandler = () => {
    // frontend validation
    if (!input.fname || !input.ename || !input.password) {
      alert("Please fill all required fields");
      return;
    }
    if (!input.studentId || !input.yearClassDept) {
      alert("Please enter Student ID and Year/Class/Dept");
      return;
    }
    if (!input.termsAccepted) {
      alert("You must accept the Terms of Service");
      return;
    }

    axios
      .post(`${baseurl}/api`, input)
      .then((res) => {
        alert(res.data.message);
        navigate("/L");
      })
      .catch((error) => {
        console.log(error);
        alert(error.response?.data?.message || "Signup failed");
      });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg,#e0c3fc 0%,#8ec5fc 100%)",
      }}
    >
      <Box
        sx={{
          width: 400,
          p: 4,
          background: "#fff",
          borderRadius: 5,
          boxShadow: "0 6px 32px rgba(132, 50, 255, 0.14)",
        }}
      >
        <Typography
          variant="h3"
          align="center"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "#152fc5ff",
            fontFamily: "italian",
            letterSpacing: "2px",
          }}
        >
          CAMPUS CASH
        </Typography>

        <Typography
          variant="h6"
          align="center"
          sx={{
            color: "#84889eff",
            mb: 3,
            fontFamily: "italian",
            fontWeight: 300,
          }}
        >
          Signup Form
        </Typography>

        <TextField
          fullWidth
          label="Full Name"
          variant="filled"
          name="fname"
          onChange={inputHandler}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="College Email"
          variant="filled"
          name="ename"
          onChange={inputHandler}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Student ID Number"
          variant="filled"
          name="studentId"
          onChange={inputHandler}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Password"
          variant="filled"
          type="password"
          name="password"
          onChange={inputHandler}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          select
          label="Year / Class / Department"
          variant="filled"
          name="yearClassDept"
          onChange={inputHandler}
          defaultValue=""
          sx={{ mb: 2 }}
        >
          <MenuItem value="" disabled>
            Select Year / Class / Dept
          </MenuItem>
          <MenuItem value="First Year">First Year</MenuItem>
          <MenuItem value="Second Year">Second Year</MenuItem>
          <MenuItem value="Third Year">Third Year</MenuItem>
          <MenuItem value="Final Year">Final Year</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>

        <FormControlLabel
          sx={{ mb: 2, mt: 1 }}
          control={
            <Checkbox
              name="termsAccepted"
              color="secondary"
              onChange={inputHandler}
            />
          }
          label={
            <span style={{ color: "#512194ff", fontFamily: "italian" }}>
              I agree to the Campus Cash Terms of Service
            </span>
          }
        />

        <Button
          onClick={addHandler}
          fullWidth
          variant="contained"
          sx={{
            mt: 1,
            background:
              "linear-gradient(90deg, #4501e4ff 0%, #4d3bb4ff 100%)",
            color: "#fff",
            fontWeight: 500,
            fontFamily: "italian",
            textTransform: "none",
            fontSize: "1.1rem",
            "&:hover": {
              background:
                "linear-gradient(90deg, #2b16ebff 0%, #5a65c2ff 100%)",
            },
          }}
        >
          Sign Up
        </Button>

        <Typography
          variant="h6"
          align="center"
          sx={{
            color: "text.secondary",
            mt: 3,
            fontFamily: "italian",
          }}
        >
          Already a user?{" "}
          <Link
            to="/L"
            style={{
              fontFamily: "italian",
              color: "purple",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Signup;
