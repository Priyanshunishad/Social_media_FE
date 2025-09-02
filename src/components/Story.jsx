// import React, { useEffect } from "react";

// const Story = ({ story, onClose, onNext, onPrev }) => {
//   // Auto-next after 15s
//   useEffect(() => {
//     if (!story) return;
//     const timer = setTimeout(() => {
//       onNext();
//     }, 15000);

//     return () => clearTimeout(timer);
//   }, [story, onNext]);

//   if (!story) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//       {/* Close Button */}
//       <button
//         className="absolute top-5 right-5 text-white text-3xl"
//         onClick={onClose}
//       >
//         &times;
//       </button>

//       <div className="relative flex flex-col items-center">
//         <img
//           src={story.image}
//           alt={story.username}
//           className="w-[320px] h-[520px] object-cover rounded-2xl shadow-lg"
//         />
//         <p className="text-white mt-2 text-sm">{story.username}</p>

//         {/* Prev */}
//         <div
//           className="absolute top-1/2 left-5 text-white text-3xl cursor-pointer"
//           onClick={onPrev}
//         >
//           &#8592;
//         </div>

//         {/* Next */}
//         <div
//           className="absolute top-1/2 right-5 text-white text-3xl cursor-pointer"
//           onClick={onNext}
//         >
//           &#8594;
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Story;
