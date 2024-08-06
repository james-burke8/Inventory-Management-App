'use client'

import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase';
import { collection, getDocs, getDoc, query, doc, setDoc, deleteDoc} from 'firebase/firestore';
import { useState, useEffect } from 'react';


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
  
const item = ['tomato', 'potato', 'onion', 'carrot', 'cabbage', 'cauliflower', 'kale', 'lettuce', 'pasta', 'cheese']

export default function Home() {
  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [itemName, setItemName] = useState('')

  const updatePantry = async () => {
    const q = query(collection(firestore, 'pantry'))
    const snapshot = await getDocs(q)
    const pantryList = [] 
    snapshot.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()})
    })
    console.log(pantryList)
    setPantry(pantryList)
  }

  useEffect(() => {
    updatePantry()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      await setDoc(docRef, { count: count + 1 })
    } else {
      await setDoc(docRef, { count: 1 })
    }
    await updatePantry()
  }


  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      if (count > 1) {
        await setDoc(docRef, { count: count - 1 })
      } else {
        await deleteDoc(docRef)
      }
    } 
    await updatePantry()
  }

  return (
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
              addItem(itemName)
              setItemName('')
              handleClose()
            }}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>Add</Button>
      <Box border={'1px solid #333'}>
        <Box width='800px' height='100px' bgcolor={'#ADD8e6'} display={'flex'}>
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
  )
}
