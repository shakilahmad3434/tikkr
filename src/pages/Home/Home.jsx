import React from 'react'
import { useStopwatch } from '../../components/Stopwatch'

const Home = () => {
  const { formattedTime, start, stop, reset } = useStopwatch();
  return (
    <section className='h-screen bg-gray-900 px-48 text-white flex justify-center items-center'>
      <div className='bg-gray-800 shadow-2xl rounded-2xl p-5'>
        <h1 className='text-6xl mb-3'>{formattedTime}</h1>
        <button onClick={start} className='bg-teal-400 py-2 px-5 text-black rounded font-bold cursor-pointer mr-5'>Start</button>
        <button onClick={stop} className='bg-rose-400 py-2 px-5 text-black rounded font-bold cursor-pointer mr-5'>Stop</button>
        <button onClick={reset} className='bg-yellow-400 py-2 px-5 text-black rounded font-bold cursor-pointer'>Reset</button>
      </div>
    </section>
  )
}

export default Home