import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../AuthContext"

const About = () => {
    const { isLoggedIn } = useContext(AuthContext)

    if (!isLoggedIn) {
        return <Navigate to="/" replace />
    }

    return <h2>About</h2>
}

    export default About
