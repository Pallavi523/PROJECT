import React, { memo } from "react";
import { MinusCircle } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { RadioGroupItem } from "@/components/common/ui/radio-group";
const MCQOption = memo(({ option, index, onOptionChange, onRemove }) => (
  <div className="flex items-center gap-4 mt-2">
    <RadioGroupItem
      value={index.toString()}
      id={`option-${index}`}
      checked={option.isCorrect}
      onClick={() => onOptionChange(index, "isCorrect", true)}
    />
    <Input
      value={option.text}
      onChange={(e) => onOptionChange(index, "text", e.target.value)}
      placeholder={`Option ${index + 1}`}
      className="flex-1"
    />
    <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
      <MinusCircle className="h-4 w-4" />
    </Button>
  </div>
));

MCQOption.displayName = "MCQOption";
export default MCQOption;
