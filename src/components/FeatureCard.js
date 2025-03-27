export default function FeatureCard({ title, description }) {
    return (
      <div className="p-6 border rounded-lg shadow-md bg-card text-card-foreground">
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    );
  }
  