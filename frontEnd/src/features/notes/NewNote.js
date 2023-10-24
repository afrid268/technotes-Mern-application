import { useSelector } from 'react-redux'
import { selectAllUsers } from '../users/usersApiSlice'
import NewNoteForm from './NewNoteForm'

const NewNote = () => {
    const users = useSelector(selectAllUsers)

    if(!users?.length) return <p>Not available currently</p>

    const content =  <NewNoteForm users={users} /> 

    return content
}
export default NewNote
