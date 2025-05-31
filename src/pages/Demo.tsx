import { useState } from 'react';
import OrderBookContainer from '../lib/container/OrderBookContainer';
import { OrderBookRowPerformance } from '../lib/components/__performance__/OrderBookRowPerformance';

const Demo = () => {
  const [showPerformanceTest, setShowPerformanceTest] = useState(false);

  return (
    <div className="demo-page p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Order Book Demo</h1>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded"
          onClick={() => setShowPerformanceTest(!showPerformanceTest)}
        >
          {showPerformanceTest ? 'Hide Performance Test' : 'Show Performance Test'}
        </button>
      </div>

      {showPerformanceTest ? (
        <div className="mb-8">
          <OrderBookRowPerformance />
        </div>
      ) : (
        <OrderBookContainer />
      )}
    </div>
  );
};

export default Demo;
