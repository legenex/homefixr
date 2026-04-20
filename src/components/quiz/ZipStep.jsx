import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, CheckCircle2 } from "lucide-react";
import QuizStepWrapper from "./QuizStepWrapper";

export default function ZipStep({ data, setData }) {
  const [lookupState, setLookupState] = useState("idle"); // idle | loading | found | error
  const [locationInfo, setLocationInfo] = useState(
    data.city && data.state ? { city: data.city, state: data.state } : null
  );

  const handleZipChange = (raw) => {
    const zip = raw.replace(/\D/g, "").slice(0, 5);
    setData(d => ({ ...d, zip_code: zip, city: "", state: "" }));
    setLocationInfo(null);
    if (zip.length === 5) {
      doLookup(zip);
    } else {
      setLookupState("idle");
    }
  };

  const doLookup = async (zip) => {
    setLookupState("loading");
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!res.ok) throw new Error("not found");
      const json = await res.json();
      const place = json.places?.[0];
      if (!place) throw new Error("no place");
      const city = place["place name"];
      const state = place["state abbreviation"];
      setLocationInfo({ city, state });
      setData(d => ({ ...d, zip_code: zip, city, state }));
      setLookupState("found");
    } catch {
      setLookupState("error");
      setLocationInfo(null);
      setData(d => ({ ...d, city: "", state: "" }));
    }
  };

  return (
    <QuizStepWrapper title="What's your ZIP code?" subtitle="We'll match you with pros local to your area.">
      <div className="max-w-xs space-y-3">
        <div>
          <Label htmlFor="zip" className="text-sm font-medium mb-2 block">ZIP code</Label>
          <div className="relative">
            <Input
              id="zip"
              inputMode="numeric"
              maxLength={5}
              value={data.zip_code}
              onChange={(e) => handleZipChange(e.target.value)}
              placeholder="12345"
              className="h-14 text-2xl font-semibold tracking-widest text-center rounded-xl pr-10"
            />
            {lookupState === "loading" && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
            )}
            {lookupState === "found" && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
        </div>

        {lookupState === "found" && locationInfo && (
          <div className="flex items-center gap-2 px-4 py-3 bg-secondary/8 border border-secondary/20 rounded-xl text-sm">
            <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
            <span className="font-medium">{locationInfo.city}, {locationInfo.state}</span>
          </div>
        )}

        {lookupState === "error" && (
          <p className="text-xs text-destructive">ZIP code not found. Please double-check and try again.</p>
        )}

        {data.zip_code && data.zip_code.length < 5 && (
          <p className="text-xs text-muted-foreground">Enter all 5 digits</p>
        )}
      </div>
    </QuizStepWrapper>
  );
}