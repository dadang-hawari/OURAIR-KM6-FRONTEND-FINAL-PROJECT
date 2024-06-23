import axios from 'axios'
import { setFlightDetail, setFlightSeats } from '../reducers/flightsReducer'
import {
  assignSeatsToPassengers,
  resetSelectedSeats,
  setTransaction,
} from '../reducers/checkoutReducer'
import { toast } from 'react-toastify'

export const getFlightById = (id) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_DOMAIN_API_DEV}/api/v1/flights/search-by-id?id=${id}`
    )
    const data = response.data.data
    if (response.status === 200 || response.status === 201) {
      dispatch(setFlightDetail(data))
      dispatch(setFlightSeats(response.data.result[0]))
    }
  } catch (error) {
    console.log(error)
  }
}
export const postBooking = (navigate) => async (dispatch, getState) => {
  const token = getState()?.auth?.token
  const checkout = getState()?.checkout
  const flight_id = checkout?.idFlight
  const passengers = checkout?.penumpang
  const baby = checkout?.jumlahPenumpang?.penumpangBayi
  const booker = checkout?.pemesan?.data
  try {
    toast.loading('Mohon tunggu sebentar', {
      toastId: 'toastInfo',
    })
    const response = await axios.post(
      `${import.meta.env.VITE_DOMAIN_API_DEV}/api/v1/booking/create`,
      { passengers, baby, booker },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const data = response.data.data

    // Dispatch action if needed
    if (response.status === 201) {
      toast.dismiss('toastInfo')
      dispatch(getFlightById(flight_id))
      dispatch(resetSelectedSeats())
      dispatch(setTransaction(data))
      navigate('/menunggu-pembayaran', {
        state: {
          success: 'Pemesanan berhasil dilakukan',
        },
      })
    } else if (response.status === 200) {
      dispatch(getFlightById(flight_id))
      dispatch(resetSelectedSeats())
      toast.dismiss('toastInfo')
      toast('Ada perubahan kursi, silahkan memilih ulang kursi', {
        className: 'toast-info',
        toastId: 'toast-info',
      })
    }

    console.log('response booking :>> ', data)
    console.log('response', response)

    // Navigate if needed
    // navigate('/desired-path');
  } catch (error) {
    toast.dismiss('toastInfo')
    console.log('error.response.data.message', error.response.data.message)
    if (error?.response?.data?.message === 'Failed to authenticate token')
      toast('Token expired, silahkan untuk melakukan login ulang', {
        className: 'toast-info',
        toastId: 'toast-info',
      })
    console.log(error)
  }
}
