'use client'

import { Box, Stack, Typography, Button, Modal, TextField, Container } from '@mui/material'
import { firestore, auth } from '@/firebase';
import { collection, getDocs, getDoc, query, doc, setDoc, deleteDoc} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { update } from 'firebase/database';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  gap: 3,
  display: 'flex',
  flexDirection: 'column',
}

export default function Home() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        updatePantry(user.uid)
      } else {
        setUser(null)
        setPantry([])
      }
    });

    return () => unsubscribe()

  }, [])

  const updatePantry = async (uid) => {
    console.log(firestore)
    const q = query(collection(firestore, 'users', uid, 'pantry'))
    const snapshot = await getDocs(q)
    const pantryList = [] 
    snapshot.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()})
    })
    setPantry(pantryList)
  }

  useEffect(() => {
    updatePantry()
  }, [])

  const addItem = async (item) => {
    if (!item || !user) return; // Prevent adding an empty item
    const docRef = doc(collection(firestore, 'users', user.uid, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      await setDoc(docRef, { count: count + 1 })
    } else {
      await setDoc(docRef, { count: 1 })
    }
    await updatePantry(user.uid)
  }

  const removeItem = async (item) => {
    if (!user) return;
    const docRef = doc(collection(firestore, 'users', user.uid, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      if (count > 1) {
        await setDoc(docRef, { count: count - 1 })
      } else {
        await deleteDoc(docRef)
      }
    } 
    await updatePantry(user.uid)
  }

  const handleSignUp = async () => {
    try{
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Error Signing Up: ', error)
    }
  }

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Error Signing In: ', error)
    }
  }

  return (
    <Container sx={{ bgcolor: "skyblue", height: "100vh", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {user ? (
        <Box>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal" />
          <Button variant="contained" onClick={handleSignIn}>Sign In</Button>
          <Button variant="outlined" onClick={handleSignUp}>Sign Up</Button>
        </Box>
      ) : (
      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        flexDirection={'column'}
        gap={2}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth value={itemName} onChange={(e) => setItemName(e.target.value)}/>
              <Button variant="outlined"
              onClick={() => {
                if (itemName.trim()) { // Check if itemName is not empty or whitespace
                  addItem(itemName)
                  setItemName('')
                  handleClose()
                }
              }}>Add</Button>
            </Stack>
          </Box>
        </Modal>
        <Button variant="contained" onClick={handleOpen}>Add</Button>
        <Box border={'1px solid #333'} bgcolor={'white'}>
          <Box width='800px' height='100px' bgcolor={'#ADD8e6'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
              Pantry Items
            </Typography>
          </Box>
          <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
            {pantry.map(({name, count}) => (
              <Box
                key={name}
                width="100%"
                minHeight="150px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#f0f0f0'}
                paddingX={5}
              >
                <Typography
                  variant={'h4'}
                  color={'#333'}
                  textAlign={'center'}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography
                  variant={'h4'}
                  color={'#333'}
                  textAlign={'center'}>Quantity: {count}</Typography>

                <Button variant="outlined" onClick={() => removeItem(name)}>Remove</Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
      )}
    </Container>
  )
}
