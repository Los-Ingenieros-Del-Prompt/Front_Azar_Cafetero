export default function Background() {
  return (
    <div
      className="absolute inset-0 z-0 bg-cover bg-no-repeat"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,1), rgba(0,0,0,0.5)),
          url('/images/backgroundLogin.jpg')
        `,
        backgroundPosition: "center 50%", 
      }}
    />
    
  );
}