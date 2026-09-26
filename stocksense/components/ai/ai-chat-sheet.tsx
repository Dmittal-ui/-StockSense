// @ts-nocheck
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Sparkles, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { confirmOperation, cancelOperation } from "@/app/(dashboard)/operations/actions";
import { toast } from "sonner";
import { useRef, useState, useTransition } from "react";

export function AiChatSheet() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/agent" }),
  });
  const isLoading = status === "submitted" || status === "streaming";
  const [isPending, startTransition] = useTransition();
  const pendingOperationIds = useRef(new Set<string>());
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  const handleConfirm = (opId: string) => {
    if (pendingOperationIds.current.has(opId)) return;
    pendingOperationIds.current.add(opId);
    setPendingOperations(new Set(pendingOperationIds.current));

    startTransition(async () => {
      try {
        await confirmOperation(opId);
        toast.success("Draft confirmed successfully.");
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        pendingOperationIds.current.delete(opId);
        setPendingOperations(new Set(pendingOperationIds.current));
      }
    });
  };

  const handleCancel = (opId: string) => {
    if (pendingOperationIds.current.has(opId)) return;
    pendingOperationIds.current.add(opId);
    setPendingOperations(new Set(pendingOperationIds.current));

    startTransition(async () => {
      try {
        await cancelOperation(opId);
        toast.success("Draft cancelled.");
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        pendingOperationIds.current.delete(opId);
        setPendingOperations(new Set(pendingOperationIds.current));
      }
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-indigo-50 dark:hover:bg-indigo-950/30 group"
        >
          <Sparkles className="w-[18px] h-[18px] text-indigo-500 group-hover:text-indigo-600 transition-colors" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full border-l">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            StockSense AI
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 pr-4 py-4 -mr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground pt-10">
                <p>Hello! I can help you manage your inventory.</p>
                <p className="text-sm mt-2">Try asking me to "check stock for item X" or "draft a transfer for 5 units of item Y from Warehouse A to Warehouse B".</p>
              </div>
            )}
            
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col gap-1 ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {m.content && (
                  <div
                    className={`px-4 py-2 rounded-lg max-w-[85%] text-sm ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                )}
                
                {/* Render Tool Invocations and Results */}
                {m.toolInvocations?.map((toolInvocation) => {
                  const toolCallId = toolInvocation.toolCallId;
                  
                  if ('result' in toolInvocation) {
                    // Render Confirmation Card if tool is draftTransfer and needs confirmation
                    if (
                      toolInvocation.toolName === "draftTransfer" &&
                      toolInvocation.result.needsConfirmation
                    ) {
                      return (
                        <Card key={toolCallId} className="w-full max-w-[85%] mt-2 border-indigo-200 bg-indigo-50/50">
                          <CardContent className="p-3">
                            <p className="text-sm font-medium text-indigo-900 mb-2">Draft Transfer Created</p>
                            <p className="text-xs text-indigo-700 mb-3">{toolInvocation.result.message}</p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => handleConfirm(toolInvocation.result.operationId)}
                                disabled={isPending || pendingOperations.has(toolInvocation.result.operationId)}
                              >
                                <Check className="w-4 h-4 mr-1" /> Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full bg-white hover:bg-red-50 hover:text-red-600 border-indigo-200"
                                onClick={() => handleCancel(toolInvocation.result.operationId)}
                                disabled={isPending || pendingOperations.has(toolInvocation.result.operationId)}
                              >
                                <X className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    
                    // General tool result
                    return (
                      <div key={toolCallId} className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded-md max-w-[85%] overflow-auto">
                        <span className="font-semibold">{toolInvocation.toolName} completed.</span>
                      </div>
                    );
                  } else {
                    // Tool is still running
                    return (
                      <div key={toolCallId} className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        Running {toolInvocation.toolName}...
                      </div>
                    );
                  }
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="pt-4 border-t mt-auto">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const text = input.trim();
              if (!text || isLoading) return;
              sendMessage({ text });
              setInput("");
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask AI assistant..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
