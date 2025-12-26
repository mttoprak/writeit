import {useNavigate} from "react-router-dom";


const RegisterButton = () => {
    const navigate = useNavigate();
    return(
        <button type="button" onClick={() => navigate("/register")}>
            Register
        </button>

    )
}

export default RegisterButton;