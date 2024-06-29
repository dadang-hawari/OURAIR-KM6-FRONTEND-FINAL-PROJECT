import { faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch, useSelector } from 'react-redux'
import { getFlightRecomendation } from '../../redux/actions/flightsAction'
import { useEffect, useState } from 'react'

export default function DestinasiFavorit() {
  const airports = useSelector((state) => state?.flightLists?.flightRecomendation)
  console.log('airports :>> ', airports)
  const [chosenCountry, setChosenCountry] = useState('Indonesia')
  console.log('airports', airports)
  const dispatch = useDispatch()

  useEffect(() => {
    setFirstCountry()
  }, [])

  const setFirstCountry = () => {
    dispatch(getFlightRecomendation('Indonesia'))
    setChosenCountry('Indonesia')
  }

  const formatFlightDates = (arrivalTime, departureTime) => {
    const arrivalDay = new Date(arrivalTime).getDate()
    const departureDay = new Date(departureTime).getDate()
    return `${departureDay} - ${arrivalDay} ${new Intl.DateTimeFormat('id-ID', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(arrivalTime))}`
  }

  const getFlightsByCountry = (country) => {
    setChosenCountry(country)
    dispatch(getFlightRecomendation(country))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })
      .format(amount)
      .replace(/\D00(?=\D*$)/, '')
  }

  return (
    <div className="mt-[660px] mini:mt-[659px] minixl:mt-[620px] sm:mt-[325px]  md:mt-[340px] xl:mt-[350px] max-w-[1040px] mx-auto  md:px-0 px-4">
      <h2 className="font-bold px-5 text-xl">
        Rekomendasi <span className="text-accent">Destinasi</span>{' '}
      </h2>
      <div className="flex gap-x-3 px-5 overflow-x-auto">
        <button
          className={`text-sm  max-w-32 min-w-32 w-full h-12 my-4 rounded-xl ${
            chosenCountry === 'Indonesia' ? 'bg-secondary text-white' : 'bg-soft-blue text-black'
          }`}
          onClick={() => getFlightsByCountry('Indonesia')}
        >
          <FontAwesomeIcon icon={faSearch} className="mr-2" />
          Indonesia
        </button>
        <button
          className={`text-sm  w-fit min-w-32 px-6 h-12 my-4 rounded-xl  ${
            chosenCountry === 'Brunei Darussalam'
              ? 'bg-secondary text-white'
              : 'bg-soft-blue text-black'
          }`}
          onClick={() => getFlightsByCountry('Brunei Darussalam')}
        >
          <FontAwesomeIcon icon={faSearch} className="mr-2" />
          Brunei Darussalam
        </button>
        <button
          className={`text-sm  max-w-32 min-w-32 w-full h-12 my-4 rounded-xl ${
            chosenCountry === 'Malaysia' ? 'bg-secondary text-white' : 'bg-soft-blue text-black'
          }`}
          onClick={() => getFlightsByCountry('Malaysia')}
        >
          <FontAwesomeIcon icon={faSearch} className="mr-2" />
          Malaysia
        </button>
        <button
          className={`text-sm  max-w-32 min-w-32 w-full h-12 my-4 rounded-xl ${
            chosenCountry === 'Philippines' ? 'bg-secondary text-white' : 'bg-soft-blue text-black'
          }`}
          onClick={() => getFlightsByCountry('Philippines')}
        >
          <FontAwesomeIcon icon={faSearch} className="mr-2" />
          Philippines
        </button>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 px-4 mt-5 sm:mt-0">
        {airports?.map((airport, i) => (
          <div key={i} className="border rounded-md">
            <img
              src={airport?.toAirport?.thumbnail}
              alt={airport?.toAirport?.cityName}
              className="w-full  mb-2 min-h-40 max-h-40 object-cover rounded-t-md"
            />
            <div className=" p-1 flex flex-col gap-y-1 pb-2 px-2">
              <div className="font-[600] text-sm flex items-center gap-2">
                <span title={airport?.fromAirport?.cityName}>
                  {airport?.fromAirport?.cityName?.length > 12
                    ? airport?.fromAirport?.cityName?.slice(0, 11) + '...'
                    : airport?.fromAirport?.cityName}
                </span>
                <FontAwesomeIcon icon={faArrowRight} />
                <span title={airport?.toAirport?.cityName}>
                  {airport?.toAirport?.cityName?.length > 12
                    ? airport?.toAirport?.cityName?.slice(0, 11) + '...'
                    : airport?.toAirport?.cityName}
                </span>
              </div>
              <div className="font-bold text-secondary text-xs">
                {airport?.whomAirplaneFlights?.whomAirlinesAirplanes.name}
              </div>

              <div className="text-sm">
                {formatFlightDates(airport?.arrival_time, airport?.departure_time)}
              </div>
              <div className="text-sm">
                Harga : {'  '}
                <span className="text-red-500 font-bold">
                  {formatCurrency(airport?.ticket_price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}