import React from 'react'
import { useTimer } from '../../components/Timer'

const Home = () => {
  const { formattedTime, start, stop, reset } = useTimer();
  return (
    <div>
      <h1>{formattedTime}</h1>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}

export default Home