import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  emotions: string[];
  keyTopics: string[];
  summary: string;
  tone: string;
}

const Index = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeText = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-microtext', {
        body: { text }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis complete",
        description: "Your microtext has been analyzed successfully",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = () => {
    if (!result) return null;
    switch (result.sentiment) {
      case "positive":
        return <TrendingUp className="w-5 h-5 text-success" />;
      case "negative":
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      default:
        return <Minus className="w-5 h-5 text-warning" />;
    }
  };

  const getSentimentBadgeVariant = () => {
    if (!result) return "secondary";
    switch (result.sentiment) {
      case "positive":
        return "default"; // Will be styled with green
      case "negative":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Analysis</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Microtext Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze short texts instantly with AI. Get insights on sentiment, emotions, and key topics.
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-6 mb-8 shadow-lg border-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enter your text
              </label>
              <Textarea
                placeholder="Type or paste your microtext here (tweets, messages, reviews, etc.)..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] text-base resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {text.length}/500 characters
              </p>
            </div>
            <Button
              onClick={analyzeText}
              disabled={isAnalyzing || !text.trim()}
              className="w-full text-base py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Text
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sentiment Overview */}
            <Card className="p-6 shadow-lg border-2">
              <h2 className="text-xl font-semibold mb-4">Sentiment Analysis</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${
                  result.sentiment === "positive" 
                    ? "bg-success/10" 
                    : result.sentiment === "negative" 
                    ? "bg-destructive/10" 
                    : "bg-warning/10"
                }`}>
                  {getSentimentIcon()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      className={`capitalize text-sm px-3 py-1 ${
                        result.sentiment === "positive" 
                          ? "bg-success text-success-foreground hover:bg-success/90" 
                          : ""
                      }`}
                      variant={getSentimentBadgeVariant() as any}
                    >
                      {result.sentiment}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Score: {result.sentimentScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        result.sentiment === "positive" 
                          ? "bg-success" 
                          : result.sentiment === "negative" 
                          ? "bg-destructive" 
                          : "bg-warning"
                      }`}
                      style={{ width: `${((result.sentimentScore + 1) / 2) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Emotions */}
            <Card className="p-6 shadow-lg border-2">
              <h2 className="text-xl font-semibold mb-4">Detected Emotions</h2>
              <div className="flex flex-wrap gap-2">
                {result.emotions.map((emotion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm px-4 py-2 capitalize"
                  >
                    {emotion}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Key Topics */}
            <Card className="p-6 shadow-lg border-2">
              <h2 className="text-xl font-semibold mb-4">Key Topics</h2>
              <div className="flex flex-wrap gap-2">
                {result.keyTopics.map((topic, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-sm px-4 py-2"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Summary & Tone */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 shadow-lg border-2">
                <h2 className="text-xl font-semibold mb-3">Summary</h2>
                <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
              </Card>

              <Card className="p-6 shadow-lg border-2">
                <h2 className="text-xl font-semibold mb-3">Tone</h2>
                <Badge variant="secondary" className="text-base px-4 py-2 capitalize">
                  {result.tone}
                </Badge>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
