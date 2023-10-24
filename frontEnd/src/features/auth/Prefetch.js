import { store } from '../../app/store'
import { notesApiSlice } from '../notes/notesApiSlice'
import { usersApiSlice } from "../users/usersApiSlice"
import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import React from 'react'

const Prefetch = () => {
    useEffect ( () =>{
        console.log('subscribing')
        const users = store.dispatch(usersApiSlice.endpoints.getUsers.initiate())
        const notes = store.dispatch(notesApiSlice.endpoints.getNotes.initiate())

        return () => {
            console.log('unsubscribing')
            notes.unsubscribe()
            users.unsubscribe()
        }
    } , [])
    return <Outlet />
}

export default Prefetch
