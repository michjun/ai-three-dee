import { useEffect, useState } from "react";

export default function WaitingMessage() {
  const [joke, setJoke] = useState();
  const [showJokeAnswer, setShowJokeAnswer] = useState(false);

  const jokes = [
    ["What do you call a genie with a broken nose?", "No body nose!"],
    [
      "What do you call a genie with a great sense of humor?",
      "Laughing stock!",
    ],
    [
      "Why don't genies play soccer?",
      "Because every time they get a corner, they wish for a goal!",
    ],
    [
      "Why don't genies use to-do lists?",
      "Because they always end up rubbing out everything!",
    ],
    [
      "Why don't genies ever win at poker?",
      "Because every time they get a good hand, they wish for a full house!",
    ],
    [
      "Why did the 3D modeler bring a ladder to work?",
      "Because he heard he would be working on high-poly models!",
    ],
    [
      "Why did the 3D model cross the road?",
      "To get rendered on the other side!",
    ],
    [
      "What did the 3D model say to its designer?",
      "I feel a bit flat today, can you add some depth to my life?",
    ],
    [
      "Why don't 3D models make good secret keepers?",
      "Because you can always see right through them!",
    ],
    [
      "What did one vertex say to the other?",
      '"Between you and me, we\'ve got this edge!"',
    ],
    [
      "Why did the 3D model go to therapy?",
      "It had too many faces to deal with!",
    ],
    [
      "Why did the 3D model apply to art school?",
      "It wanted to become well-rounded!",
    ],
    [
      "Why did the genie refuse to create a 3D model?",
      "Because he didn't want to be accused of 'wishful' thinking!",
    ],
    [
      "What did the genie say to the 3D model?",
      '"You\'re one wish away from becoming a real object!"',
    ],
    [
      "Why did the genie become a 3D modeler?",
      "Because he wanted to add an extra dimension to his wishes!",
    ],
    [
      "Why was the cube always getting into trouble?",
      "Because it always has to be right!",
    ],
    [
      "Why don't cylinders use online dating?",
      "Because they're already rolling in circles!",
    ],
    ["Why was the cone feeling down?", "Because it felt pointless at the top!"],
    [
      "Why did the torus apply for a job at the donut shop?",
      "Because it wanted to feel hole again!",
    ],
    [
      "Why did the pyramid break up with the cube?",
      "Because it thought the relationship was too one-sided!",
    ],
  ];

  useEffect(() => {
    setJoke(getRandomJoke());
  }, []);

  function getRandomJoke() {
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  return (
    <div className="w-full p-4">
      <img className="h-full inline-block" src="/genie2.png" alt="logo" />
      <div className="pt-4 text-center">
        Apologies for the sands of time trickling slowly, dear friend. Exquisite
        creations demand patience, after all! While my magical incantations
        weave the fabric of your 3D wish, how about we share a chuckle or two?
        <br />
        <br />
        Ready for a jest? Here goes:
        <br />
        <br />
        {joke && (
          <div className="font-bold">
            {joke[0]}
            <br />
            <span
              className={showJokeAnswer ? "" : "bg-black cursor-pointer"}
              onClick={() => {
                setShowJokeAnswer(true);
              }}
            >
              {joke[1]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
