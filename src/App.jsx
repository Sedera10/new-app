import { useState } from 'react'
import { initSession, getItems, createItem, updateItem, deleteItem } from "./services/api";

function App() {
  const [error, setError] = useState(null)
  const [ordi, setOrdi] = useState([])

  const handleAuth = async () => {
    try {
      const token = await initSession("glpi", "glpi");
      console.log("Session token:", token);
    } catch (error) {
      console.log(error.message)
      setError(error.message)
    }
  }

  const handleClickComputer = async () => {
    try {
      const liste = await getItems("User");
      console.log(liste)
      setOrdi(liste)
    } catch (error) {
      console.log(error.message)
      setError(error.message)
    } 
  }

  const testCreate = async () => {
    try {
      const payload = {
        name: "Type 1 ordinateur",
        comment: "Premier teste type ordinateur",
        date_creation: "2026-06-03 00:00:00"
      }
      const test = await createItem("ComputerType", payload)
      console.log("Creation de nouveau type id:", test.id)
      console.log("Data : ", test)
    } catch (e) {
      console.log(e.message)
      setError(e.message)
    }
  }

  const testDelete = async () => {
    try {
      const payload = {
        name: "Type 3 teste ",
        date_creation : '2026-06-03 00:00:00'
      }
      const test = await deleteItem("ComputerType", 5)
      if(test) {
        console.log("SUppression faite : id ", 5)
      }
    } catch (e) {
      console.log(e.message)
      setError(e.message)
    }
  }

  return (
    <>
      <h1>Hello</h1>
      <button onClick={handleAuth}>Connexion</button>
      <button onClick={handleClickComputer}>Teste Liste</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {ordi.length > 0 && ordi.map(pc => <p key={pc.id}>{pc.name}</p>)}
    </>
  )
}

export default App