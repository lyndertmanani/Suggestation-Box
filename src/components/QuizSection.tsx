import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { QUIZ_QUESTIONS } from '@/types/database';
import { useSubmissionLimits } from '@/hooks/useSubmissionLimits';
import { useToast } from '@/hooks/use-toast';

interface QuizSectionProps {
  isActive: boolean;
}

export const QuizSection = ({ isActive }: QuizSectionProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const { userId } = useSubmissionLimits();
  const { toast } = useToast();

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNext = () => {
    if (selectedAnswer === '') {
      toast({
        title: "Please select an answer",
        variant: "destructive"
      });
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(selectedAnswer);
    setAnswers(newAnswers);
    setSelectedAnswer('');

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = async (finalAnswers: number[]) => {
    const calculatedScore = finalAnswers.reduce((score, answer, index) => {
      return score + (answer === QUIZ_QUESTIONS[index].correct ? 1 : 0);
    }, 0);

    setScore(calculatedScore);
    setIsCompleted(true);

    if (userId) {
      try {
        await supabase.from('quiz_responses').insert({
          user_id: userId,
          answers: finalAnswers,
          score: calculatedScore
        });

        toast({
          title: "Quiz completed!",
          description: `You scored ${calculatedScore} out of ${QUIZ_QUESTIONS.length}`
        });
      } catch (error) {
        console.error('Error saving quiz response:', error);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer('');
    setIsCompleted(false);
    setScore(null);
  };

  if (!isActive) {
    return null;
  }

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{QUIZ_QUESTIONS.length}
            </div>
            <p className="text-muted-foreground">
              {score! >= 12 ? "Excellent work!" : 
               score! >= 9 ? "Good job!" : 
               score! >= 6 ? "Not bad, but room for improvement" : 
               "Consider reviewing the material"}
            </p>
          </div>
          <Button onClick={resetQuiz} className="w-full">
            Take Quiz Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Value Proposition Quiz</CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {String.fromCharCode(65 + index)}) {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <Button 
          onClick={handleNext} 
          className="w-full"
          disabled={selectedAnswer === ''}
        >
          {currentQuestion === QUIZ_QUESTIONS.length - 1 ? 'Complete Quiz' : 'Next Question'}
        </Button>
      </CardContent>
    </Card>
  );
};