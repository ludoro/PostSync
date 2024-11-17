import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
}

const PlanSelectionOverlay = ({ onSelectPlan }: { onSelectPlan: (plan: Plan) => void }) => {
  const plans: Plan[] = [
    {
      name: 'Starter',
      price: '$9',
      description: 'Perfect if you are just starting out :)',
      features: [
        'Up to 30 scheduled posts per month',
      ]
    },
    {
      name: 'Advanced',
      price: '$29',
      description: 'For tech creators looking to scale :)',
      features: [
        'Up to 100 scheduled posts per month',
      ]
    },
    {
      name: 'Pro',
      price: '$49',
      description: 'You know your stuff!',
      features: [
        'Unlimited posts',
        'Get help to improve your posts using AI (unlimited)',
        'Generate images for your posts using AI (up to 30 images a month)'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl p-6">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Choose Your Plan
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className="bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}
                  <span className="text-base font-normal text-gray-600">/month</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => onSelectPlan(plan)}
                  variant={plan.name === 'Pro' ? 'default' : 'outline'}
                >
                  Select {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionOverlay;