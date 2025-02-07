import { Users, Settings, BookOpen } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'User Management',
    description: 'Comprehensive user management with role assignment and profile controls.',
  },
  {
    icon: Settings,
    title: 'Permission System',
    description: 'Granular permissions with role inheritance and hierarchical access control.',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Extensive documentation and examples to get you started quickly.',
  },
];

export function Features() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-card p-6 rounded-lg shadow-lg">
            <feature.icon className="h-12 w-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}