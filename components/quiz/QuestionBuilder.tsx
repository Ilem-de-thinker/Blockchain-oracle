import React, { useState } from 'react';
import { QuizQuestion, QuizOption } from '../../../src/api/quizzes';

interface QuestionBuilderProps {
  question: QuizQuestion;
  index: number;
  onUpdate: (index: number, question: QuizQuestion) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  question,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const handleQuestionTextChange = (text: string) => {
    onUpdate(index, { ...question, text });
  };

  const handleAddOption = () => {
    const newOptions = [
      ...(question.options || []),
      { text: '', is_correct: false } as QuizOption,
    ];
    onUpdate(index, { ...question, options: newOptions });
  };

  const handleOptionChange = (optionIndex: number, field: keyof QuizOption, value: string | boolean) => {
    const updatedOptions = [...(question.options || [])];
    const oldOption = updatedOptions[optionIndex];
    updatedOptions[optionIndex] = { ...oldOption, [field]: value };

    // If marking as correct, unmark other options
    if (field === 'is_correct' && value === true) {
      updatedOptions.forEach((opt, idx) => {
        if (idx !== optionIndex) {
          updatedOptions[idx] = { ...opt, is_correct: false };
        }
      });
    }

    onUpdate(index, { ...question, options: updatedOptions });
  };

  const handleRemoveOption = (optionIndex: number) => {
    const updatedOptions = (question.options || []).filter((_, idx) => idx !== optionIndex);
    onUpdate(index, { ...question, options: updatedOptions });
  };

  return (
    <div className="backdrop-blur-md bg-surface/60 border border-border/30 rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold tracking-tight text-text">
          Question {index + 1}
        </h3>
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
          >
            <XCircle className="h-4 w-4" />
            Remove
          </button>
        )}
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text mb-2">
          Question Text *
        </label>
        <Textarea
          value={question.text}
          onChange={(e) => handleQuestionTextChange(e.target.value)}
          placeholder="Enter your question..."
          rows={2}
          className="border-border/50 bg-surface/50"
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text">
            Answer Options *
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddOption}
            className="text-purple-600 hover:text-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Option
          </Button>
        </div>

        {question.options?.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl border border-border/30">
            {/* Correct Answer Radio */}
            <button
              type="button"
              onClick={() => handleOptionChange(optionIndex, 'is_correct', true)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                option.is_correct
                  ? 'border-purple-600 bg-purple-600'
                  : 'border-border hover:border-purple-300'
              }`}
            >
              {option.is_correct && <div className="w-2 h-2 rounded-full bg-white" />}
            </button>

            {/* Option Text */}
            <Input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(optionIndex, 'text', e.target.value)}
              placeholder={`Option ${optionIndex + 1}`}
              className="flex-1 border-border/50 bg-surface/80"
            />

            {/* Remove Option */}
            {(question.options?.length || 0) > 2 && (
              <button
                onClick={() => handleRemoveOption(optionIndex)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
          Click the circle to mark the correct answer
        </p>
      </div>
    </div>
  );
};
