import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import ReactModal from 'react-modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import SeatPicker from '../../components/Checkout/SeatPicker'
import {
  assignSeatsToPassengers,
  resetSelectedSeats,
  setDonation,
  setJumlahPenumpang,
  setPemesan,
  setPenumpang,
  setUseCurrentEmail,
  updateBerlakuSampai,
  updatePenumpang,
  updateTanggalLahir,
} from '../../redux/reducers/checkoutReducer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getFlightById, postBooking } from '../../redux/actions/checkoutAction'
import { formatTimeToHM, formatTimeToIndonesia } from '../../utils/timeFormatter'
import { Flip, toast } from 'react-toastify'
import Toast from '../../components/common/Toast'
import BackToTop from '../../components/common/BackToTop'
import { setPage } from '../../redux/reducers/otpReducers'
import { customStylesDestination } from '../../styles/customStyles'
import SkeletonDetailPesanan from '../../components/RiwayatPesanan/SkeletonDetailPesanan'
import IsiDataPenumpang from '../../components/Checkout/IsiDataPenumpang'
import { setPrevPage } from '../../redux/reducers/notifReducer'
import ScrollToTop from '../../components/common/ScrollToTop'

export default function CheckoutBiodataPemesan() {
  const emailnow = useSelector((state) => state?.auth?.userData?.email)
  const flightLists = useSelector((state) => state?.flightLists)
  const flightDetail = flightLists?.flightDetail
  const flightSeats = flightLists?.flightSeats
  const dataCheckout = useSelector((state) => state?.checkout)
  const selectedSeats = dataCheckout?.selectedSeats
  const flight_id = dataCheckout?.idFlight
  const pemesan = dataCheckout?.pemesan
  const penumpang = dataCheckout?.penumpang
  const donasi = dataCheckout?.donation ? dataCheckout?.donation : 10000
  const useCurrentEmail = dataCheckout?.useCurrentEmail
  const [isUserDonate, setIsUserDonate] = useState(false)
  const seatClass = flightDetail?.class
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const penumpangSaatIni = dataCheckout?.jumlahPenumpang
  const jumlahPenumpang = location?.state?.jumlahPenumpang
  const [email, setEmail] = useState(useCurrentEmail ? emailnow : pemesan.data.email)
  const pajak =
    (penumpangSaatIni?.penumpangAnak + penumpangSaatIni?.penumpangDewasa) *
    flightDetail?.ticket_price *
    0.1

  const [isLoading, setIsLoading] = useState(false)

  const hargaTiketAnak = flightDetail?.ticket_price * penumpangSaatIni?.penumpangAnak
  const hargaTiketDewasa = flightDetail?.ticket_price * penumpangSaatIni?.penumpangDewasa
  const jumlahPenumpangAnak = penumpangSaatIni?.penumpangAnak
  const jumlahPenumpangDewasa = penumpangSaatIni?.penumpangDewasa
  const jumlahPenumpangBayi = penumpangSaatIni?.penumpangBayi
  const isLoggedin = useSelector((state) => state?.auth?.isLoggedin)
  const message =
    'Mohon maaf, jumlah kursi di maskapai ini kurang dari jumlah penumpang yang telah dipilih. Silahkan melakukan ulang maskapai penerbangan'
  const toastId = 'toastInfo'
  const toastClass = 'toast-info'

  const setDataPenumpang = () => {
    // percabangan if biar inputan nggak kereset jika misalnya tidak ada perubahan penumpang
    if (
      (penumpangSaatIni?.penumpangDewasa === jumlahPenumpang?.penumpangDewasa &&
        penumpangSaatIni?.penumpangAnak === jumlahPenumpang?.penumpangAnak &&
        penumpangSaatIni?.penumpangBayi === jumlahPenumpang?.penumpangBayi) ||
      jumlahPenumpang?.penumpangDewasa === null ||
      jumlahPenumpang?.penumpangDewasa === undefined
    ) {
      // Function buat mastiin flight id nya keupdate jika misalnya user memilih flight yang berbeda walaupun tidak ada perubahan penumpang
      updateFlightIdInPenumpangBaru()
      return
    }

    dispatch(setJumlahPenumpang(jumlahPenumpang))
    dispatch(resetSelectedSeats())
    const { penumpangDewasa, penumpangAnak } = jumlahPenumpang ?? {}
    const penumpangBaru = []
    for (let i = 0; i < penumpangDewasa; i++) {
      penumpangBaru.push({
        id: `penumpang ${i + 1} - Dewasa`,
        title: 'Mr.',
        fullname: '',
        surname: '',
        birth_date: '',
        nationality: '',
        document: '',
        country_publication: 'Indonesia',
        document_expired: '',
        ticket: { flight_id: flight_id },
        category: 'adult',
        seat_number: '',
      })
    }

    for (let i = 0; i < penumpangAnak; i++) {
      penumpangBaru.push({
        id: `penumpang ${penumpangDewasa + i + 1} - Anak`,
        title: 'Mr.',
        fullname: '',
        surname: '',
        birth_date: '',
        nationality: '',
        document: '',
        country_publication: 'Indonesia',
        document_expired: '',
        ticket: { flight_id: flight_id },
        category: 'child',
        seat_number: '',
      })
    }

    dispatch(setPenumpang(penumpangBaru))
  }

  const checkFlightId = () => {
    if (!flight_id) {
      navigate('/')
      return
    }
  }

  useEffect(() => {
    checkFlightId()
  }, [])

  useEffect(() => {
    setEmail(useCurrentEmail ? emailnow : pemesan.data.email)
  }, [useCurrentEmail, emailnow, pemesan.data.email])

  useEffect(() => {
    // Inisialisasi state penumpang berdasarkan jumlah penumpangSaatIni
    setDataPenumpang()
    setIsLoading(true)
    dispatch(getFlightById(flight_id)).then(() => setIsLoading(false))
  }, [penumpangSaatIni])

  const updateFlightIdInPenumpangBaru = () => {
    // Mengupdate flight_id pada setiap penumpang di penumpangBaru
    const updatedPenumpang = penumpang?.map((penumpang) => ({
      ...penumpang,
      ticket: { flight_id: flight_id },
    }))
    dispatch(setPenumpang(updatedPenumpang))
  }

  const handlePenumpang = (e, id) => {
    const { name, value } = e.target
    dispatch(updatePenumpang({ id, name, value }))
  }

  const handleTanggalLahirChange = (date, id) => {
    dispatch(updateTanggalLahir({ id, date: date.format('YYYY-MM-DD') }))
  }

  const handleBerlakuSampaiChange = (date, id) => {
    dispatch(updateBerlakuSampai({ id, date: date.format('YYYY-MM-DD') }))
  }

  const handleDonasi = (e) => {
    dispatch(setDonation(e.target.value))
  }

  const handlePemesan = (e) => {
    let { name, value } = e.target
    dispatch(setPemesan({ name, value }))
  }

  const handleLanjutBayar = () => {
    if (!pemesan?.data?.fullname || !pemesan?.data?.phone_number || !pemesan?.data?.email) {
      toast('Mohon lengkapi semua data diri pemesan yang perlu diisi.', {
        toastId: 'toastError',
        className: 'toast-error',
      })
      return
    }

    for (const penumpangData of penumpang) {
      const { fullname, birth_date, nationality, document, document_expired } = penumpangData

      if (
        !fullname.trim() ||
        !birth_date.trim() ||
        !nationality.trim() ||
        !document.trim() ||
        !document_expired.trim()
      ) {
        // Display toast for the first found error
        if (!fullname) {
          toast(`Mohon lengkapi nama lengkap untuk ${penumpangData.id}`, {
            className: 'toast-error',
          })
        } else if (!birth_date) {
          toast(`Mohon isi tanggal lahir untuk ${penumpangData.id}`, {
            className: 'toast-error',
          })
        } else if (!nationality) {
          toast(`Mohon isi kewarganegaraan untuk ${penumpangData.id}`, {
            className: 'toast-error',
          })
        } else if (!document) {
          toast(`Mohon isi nomor KTP/Paspor untuk ${penumpangData.id}`, {
            className: 'toast-error',
          })
        } else if (!document_expired) {
          toast(`Mohon isi tanggal kadaluarsa dokumen untuk ${penumpangData.id}`, {
            className: 'toast-error',
          })
        }

        return
      }
    }

    if (selectedSeats.length < jumlahPenumpangAnak + jumlahPenumpangDewasa) {
      toast(
        `Mohon pastikan agar Anda telah memilih ${
          jumlahPenumpangAnak + jumlahPenumpangDewasa
        } kursi`,
        {
          toastId: 'toastInfo',
          className: 'toast-error',
        }
      )
      return
    }

    dispatch(assignSeatsToPassengers(selectedSeats))
    dispatch(setPage('checkout'))
    dispatch(postBooking(navigate, isUserDonate))
  }
  const handleToggle = () => {
    dispatch(setUseCurrentEmail(!useCurrentEmail))
    if (useCurrentEmail !== true) handlePemesan({ target: { name: 'email', value: emailnow } })
    else {
      handlePemesan({ target: { name: 'email', value: email } })
    }
  }

  const handleToggleDonation = () => {
    setIsUserDonate(!isUserDonate)
  }

  const handleButtonMasuk = () => {
    dispatch(setPrevPage('/checkout-pemesanan'))
    navigate('/login')
  }

  ReactModal.setAppElement('#modal')
  return (
    <div>
      <ReactModal
        isOpen={!isLoggedin}
        style={customStylesDestination}
        className="border-none absolute top-7 w-full outline-none"
      >
        <div
          className="bg-[#FF0000] text-center py-10 border-none px-4 text-white w-full rounded-md relative "
          tabIndex={-4}
        >
          <h2 className="text-2xl">Silahkan login terlebih dahulu</h2>
          <button
            onClick={handleButtonMasuk}
            className="border border-white rounded-md py-2 px-8 my-4 text-base"
          >
            Masuk
          </button>
          <h3>Anda akan diarahkan ke halaman ini setelah login</h3>
        </div>
      </ReactModal>
      <ScrollToTop />
      <Navbar />
      <div className="max-w-5xl px-5 mx-auto mt-24">
        <div className="text-xl cursor-default text-gray-400 flex items-center gap-x-2">
          <b className="text-black">Isi Data Diri</b>
          <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
          <b>Bayar</b>
          <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
          <b>Selesai</b>
        </div>

        <div className="text-sm mt-4 flex gap-8 flex-col md:flex-row w-full">
          <div className="w-full">
            {/* Isi Data Pemesan */}
            <div className="border rounded-md h-fit p-5 w-full">
              <b className="text-xl mb-3 block">Isi Data Pemesan</b>
              <div className="w-full text-gray-secondary">
                <h2 className="bg-gray-700 text-white rounded-t-md p-2 text-[600]">
                  Data Diri Pemesan
                </h2>
                <div className="w-full py-3 px-0 sm:p-3 flex flex-col gap-y-4">
                  <div>
                    <label className="font-bold" htmlFor="fullname">
                      Nama Lengkap
                      <span className="text-red-500 font-normal" title="Perlu diisi">
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      className="w-full border outline-none focus:border-secondary rounded-md h-10 ps-3 mt-1 py-4"
                      placeholder="Masukkan nama lengkap"
                      id="fullname"
                      required
                      name="fullname"
                      value={pemesan.data.fullname}
                      onChange={handlePemesan}
                    />
                  </div>

                  <div>
                    <label className="font-bold" htmlFor="surname">
                      Nama Keluarga (opsional)
                    </label>
                    <input
                      type="text"
                      className="w-full border outline-none focus:border-secondary rounded-md h-10 ps-3 mt-1 py-4"
                      placeholder="Masukkan nama keluarga"
                      id="surname"
                      name="surname"
                      value={pemesan.data.surname}
                      onChange={handlePemesan}
                    />
                  </div>
                  <div>
                    <label className="font-bold" htmlFor="phone_number">
                      Nomor Telepon
                      <span className="text-red-500 font-normal" title="Perlu diisi">
                        *
                      </span>
                    </label>
                    <input
                      type="number"
                      className="w-full border outline-none focus:border-secondary rounded-md h-10 ps-3 mt-1 py-4"
                      placeholder="Masukkan nomor telepon"
                      id="phone_number"
                      required
                      name="phone_number"
                      value={pemesan.data.phone_number}
                      onChange={handlePemesan}
                    />
                  </div>
                  <div>
                    <div className="flex mb-2 justify-between">
                      <p>Gunakan email saat ini?</p>
                      <button
                        onClick={handleToggle}
                        id="useCurrentEmail"
                        name="useCurrentEmail"
                        aria-label="Toggle Email Saat Ini"
                        type="button"
                        className={`w-10 h-5 flex items-center rounded-full transition-colors duration-300 cursor-pointer ${
                          useCurrentEmail ? 'bg-accent' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow-lg transform transition-transform ${
                            useCurrentEmail ? 'translate-x-full' : 'translate-x-0'
                          }`}
                        ></div>
                      </button>
                    </div>
                    <label className="font-bold" htmlFor="email">
                      Email
                      <span className="text-red-500 font-normal" title="Perlu diisi">
                        *
                      </span>
                    </label>
                    <input
                      type="email"
                      required
                      className={`w-full border outline-none focus:border-secondary rounded-md h-10 ps-3 mt-1 py-4 ${
                        useCurrentEmail ? 'cursor-default' : ''
                      }`}
                      placeholder="Contoh: kusuma@gmail.com"
                      id="email"
                      name="email"
                      readOnly={useCurrentEmail}
                      value={useCurrentEmail ? emailnow : pemesan.data.email}
                      onChange={handlePemesan}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Isi Data Penumpang */}

            <IsiDataPenumpang
              penumpang={penumpang}
              handlePenumpang={handlePenumpang}
              handleBerlakuSampaiChange={handleBerlakuSampaiChange}
              handleTanggalLahirChange={handleTanggalLahirChange}
            />

            {/* Kursi */}
            <div className="border rounded-md h-fit my-8 p-5 w-full">
              <b className="text-xl mb-3 block">Pilih Kursi</b>
              <div className="w-full text-gray-secondary">
                <h2 className="bg-gray-700 text-white text-center rounded-t-md p-2 text-[600]">
                  {seatClass === 'FIRSTCLASS'
                    ? 'First Class'
                    : seatClass === 'ECONOMY'
                    ? 'Economy'
                    : 'Business'}{' '}
                  - {flightSeats?.totalAvailableSeats} Kursi Tersedia
                </h2>
                <div className="w-full p-3 flex flex-col gap-y-4">
                  <SeatPicker />
                </div>
              </div>
            </div>
          </div>

          {/* Detail Penerbangan */}
          {isLoading ? (
            <SkeletonDetailPesanan />
          ) : (
            <div className="w-full md:max-w-[376px] h-fit border p-4 ">
              <div className="w-full">
                <div className="flex justify-between mt-2">
                  <h2 className="font-bold text-xl">Detail Penerbangan</h2>
                </div>
                <div className="flex justify-between mt-2">
                  <b className="font-bold">{formatTimeToHM(flightDetail?.departure_time)}</b>
                  <b className="text-blue-400">Keberangkatan</b>
                </div>
                <p className="my-1">{formatTimeToIndonesia(flightDetail?.departure_time)}</p>
                <b className="font-[600]">{flightDetail?.fromAirport?.name}</b>
                <div className="text-sm">
                  <hr className="w-[95%] mx-auto my-3 " />
                  <div className="flex items-center gap-x-2">
                    <img
                      src="/assets/images/brand_airlines.webp"
                      alt="brand airlined"
                      height="20"
                      width="20"
                    />
                    <div className="w-full">
                      <div className="font-bold">
                        {flightDetail?.whomAirplaneFlights?.whomAirlinesAirplanes?.name} -{' '}
                        {seatClass === 'FIRSTCLASS'
                          ? 'First Class'
                          : seatClass === 'ECONOMY'
                          ? 'Economy'
                          : 'Business'}
                      </div>

                      <b>{flightDetail?.whomAirplaneFlights?.airplane_code}</b>
                      <div>
                        <b>Informasi:</b>
                        <p>{flightDetail?.whomAirplaneFlights?.baggage} kg</p>
                        <p>{flightDetail?.whomAirplaneFlights?.cabin_baggage} kg</p>
                        <p>In Flight Entertainment</p>
                      </div>
                    </div>
                  </div>
                  <hr className="w-[95%] mx-auto my-3 " />
                  <div>
                    <div className="flex justify-between">
                      <h3 className="font-bold">{formatTimeToHM(flightDetail?.arrival_time)}</h3>
                      <b className="text-blue-400">Kedatangan</b>
                    </div>
                    <h4>{formatTimeToIndonesia(flightDetail?.arrival_time)}</h4>
                    <h5 className="font-[600]">{flightDetail?.toAirport?.name}</h5>
                  </div>
                  <hr className="w-[95%] mx-auto mt-3 mb-2 " />
                  <div
                    className="relative py-1 w-fit mb-2  pt-2"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <span className="cursor-default font-600 bg-secondary text-white rounded-full py-1 px-2 text-xs">
                      Apa itu SDGs?
                    </span>
                    <div
                      className={` ${
                        isHovered ? 'opacity-100   ' : 'opacity-0 scale-0 '
                      } transition-all  w-56 mini:w-80 py-5 absolute overflow-auto md:left-0 xl:right-0 bottom-8  bg-white text-gray-700  shadow-[0_0_5px_0_rgb(0,0,0,0.3)] px-2 rounded-md`}
                    >
                      <b>Berdonasi untuk Sustainable Development Goals (SDGs)</b>
                      <p className="text-[12px] my-2">
                        SDGs adalah serangkaian tujuan global yang ditetapkan oleh PBB di tahun
                        2015. Bertujuan untuk mengakhiri kemiskinan, kelaparan, meningkatkan
                        kualitas pendidikan dan memastikan bahwa semua orang memiliki kesempatan
                        untuk hidup sejahtera dan damai. Dengan setiap donasi Anda, Anda turut
                        berkontribusi dalam upaya global untuk mencapai Sustainable Development
                        Goals (SDGs).
                      </p>
                      <Link to="/sdgs" className="text-blue-400 text-xs" target="_blank">
                        Baca selengkapnya<span className="tracking-wider">...</span>{' '}
                      </Link>
                    </div>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <span className="font-[600]">Donasi untuk SDGs</span>
                    <button
                      onClick={handleToggleDonation}
                      id="useCurrentEmail"
                      name="useCurrentEmail"
                      aria-label="Toggle Email Saat Ini"
                      type="button"
                      className={`w-10 h-5 flex items-center rounded-full transition-colors duration-300 cursor-pointer ${
                        isUserDonate ? 'bg-accent' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-lg transform transition-transform ${
                          isUserDonate ? 'translate-x-full' : 'translate-x-0'
                        }`}
                      ></div>
                    </button>
                  </div>
                  <div
                    id="donation"
                    className={`transition-all duration-500 ${isUserDonate ? 'block' : 'hidden'}`}
                  >
                    <label
                      htmlFor="donasi"
                      className={`transition-all duration-500 ${
                        isUserDonate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'
                      }`}
                    >
                      Jumlah yang ingin didonasikan
                    </label>
                    <div
                      className={`relative transition-all duration-500 ${
                        isUserDonate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'
                      }`}
                    >
                      <select
                        id="donationAmount"
                        name="donationAmount"
                        aria-label="Pilih Jumlah Donasi"
                        onChange={handleDonasi}
                        value={donasi}
                        className="w-full border outline-none cursor-pointer focus:border-secondary rounded-md ps-1 mt-1 py-3"
                      >
                        <option value="10000">Rp 10.000</option>
                        <option value="20000">Rp 20.000</option>
                        <option value="50000">Rp 50.000</option>
                        <option value="100000">Rp 100.000</option>
                        <option value="200000">Rp 200.000</option>
                        <option value="500000">Rp 500.000</option>
                        <option value="1000000">Rp 1.000.000</option>
                      </select>
                    </div>
                    <p
                      className={`text-xs mt-2 text-gray-600 transition-all duration-500 ${
                        isUserDonate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'
                      }`}
                    >
                      Minimal donasi adalah Rp 10.000, maksimal Rp. 1.000.000
                    </p>
                  </div>

                  <hr className="w-[95%] mx-auto my-3 " />
                  <div className="w-full">
                    <b>Rincian Harga</b>
                    <div className={`flex justify-between ${!jumlahPenumpangDewasa && 'hidden'}`}>
                      <div className="flex">
                        <span className="w-3">{jumlahPenumpangDewasa} </span> Orang Dewasa{' '}
                      </div>
                      <span>IDR {hargaTiketDewasa.toLocaleString('id-ID')}</span>
                    </div>
                    <div className={`flex justify-between ${!jumlahPenumpangAnak && 'hidden'}`}>
                      <div className="flex">
                        <span className="w-3">{jumlahPenumpangAnak}</span> Orang Anak{' '}
                      </div>
                      <span>IDR {hargaTiketAnak.toLocaleString('id-ID')}</span>
                    </div>
                    <div className={`flex justify-between ${!jumlahPenumpangBayi && 'hidden'}`}>
                      <div className="flex">
                        <span className="w-3">{jumlahPenumpangBayi}</span> Bayi
                      </div>
                      <span>IDR 0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak</span>
                      <span>IDR {pajak?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className={`flex justify-between ${!isUserDonate && 'hidden'}`}>
                      <span>Donasi</span>
                      <span>
                        IDR {donasi ? parseInt(donasi).toLocaleString('id-ID') : '10.000'}
                      </span>
                    </div>
                  </div>
                  <hr className="w-[95%] mx-auto my-3 " />
                </div>

                <div className="flex justify-between text-base">
                  <b>Total</b>
                  <b className="text-secondary">
                    IDR{' '}
                    {(
                      hargaTiketAnak +
                      hargaTiketDewasa +
                      pajak +
                      (isUserDonate ? parseInt(donasi) : 0)
                    ).toLocaleString('id-ID')}
                  </b>
                </div>

                <button
                  onClick={handleLanjutBayar}
                  disabled={isLoading}
                  className="bg-secondary text-white text-base text-center px-5 my-4 rounded-xl py-5 w-full"
                >
                  Lanjut bayar
                </button>
              </div>
            </div>
          )}
        </div>
        <BackToTop />
        <Toast margin="mt-16" transition={Flip} />
      </div>
    </div>
  )
}
