export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-transparent">
      <h1 className="font-sans text-7xl text-neutral-800 dark:text-neutral-200 mb-8">
        Sumanize
      </h1>
      <p className="font-sans text-lg text-neutral-700 dark:text-neutral-300 mb-2 text-center max-w-2xl">
        Lorem ipsum dolor sit amet,{" "}
        <span className="font-mono">consectetur</span> adipiscing elit. Sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
        minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
        ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 mt-6 overflow-x-auto w-full max-w-2xl">
        <code className="font-mono text-sm text-neutral-800 dark:text-neutral-200">
          {`// Maximum Subarray (Kadane's Algorithm) in TypeScript
function maxSubArray(nums: number[]): number {
  let maxSoFar = nums[0];
  let currMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currMax = Math.max(nums[i], currMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currMax);
  }
  return maxSoFar;
}

// Example usage:
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // Output: 6
`}
        </code>
      </pre>
    </main>
  );
}
