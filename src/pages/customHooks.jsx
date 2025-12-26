import { useState } from "react";
const useContador =()=>{
    const [count, setCount]=useState(0)
    const sumar=()=> setCount(count+1)
    const restar=()=> setCount(count-1)
    return(
        {
            count,
            sumar,
            restar
        }
    )
}

export default useContador