export default function Testimonial({ name, feedback }) {
    return (
      <div className="p-6 border rounded-lg shadow-md bg-card text-card-foreground">
        <p className="text-lg italic">"{feedback}"</p>
        <h4 className="mt-2 font-medium">- {name}</h4>
      </div>
    );
  }
  