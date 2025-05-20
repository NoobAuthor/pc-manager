export default function AnimatedSpinner() {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#000000"
      aria-label="Loading indicator"
      role="img"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2">
          <circle strokeOpacity=".5" cx="24" cy="24" r="6">
            <animate
              attributeName="r"
              begin="1.5s"
              dur="3s"
              values="6;22"
              calcMode="linear"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="1.5s"
              dur="3s"
              values=".5;1;0"
              calcMode="linear"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-width"
              begin="1.5s"
              dur="3s"
              values="2;0"
              calcMode="linear"
              repeatCount="indefinite"
            />
          </circle>
          <circle strokeOpacity=".5" cx="24" cy="24" r="22">
            <animate
              attributeName="r"
              begin="3s"
              dur="3s"
              values="6;22"
              calcMode="linear"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="3s"
              dur="3s"
              values=".5;1;0"
              calcMode="linear"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-width"
              begin="3s"
              dur="3s"
              values="2;0"
              calcMode="linear"
              repeatCount="indefinite"
            />
          </circle>
          <circle strokeOpacity=".5" cx="24" cy="24" r="22">
            <animate
              attributeName="r"
              begin="4.5s"
              dur="3s"
              values="6;22"
              calcMode="linear"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="4.5s"
              dur="3s"
              values=".5;1;0"
              calcMode="linear"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-width"
              begin="4.5s"
              dur="3s"
              values="2;0"
              calcMode="linear"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>
    </svg>
  );
}
