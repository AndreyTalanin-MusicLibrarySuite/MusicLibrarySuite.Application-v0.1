FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base

EXPOSE 80
EXPOSE 443

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y build-essential libjpeg-dev libpng-dev libxi6 libgl1-mesa-glx
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y build-essential libjpeg-dev libpng-dev libxi6 libgl1-mesa-glx
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs

ARG NuGetUsername
ARG NuGetClearTextPassword

ENV NUGET_USERNAME=$NuGetUsername
ENV NUGET_CLEARTEXTPASSWORD=$NuGetClearTextPassword

WORKDIR "/src"
COPY ["Template.NuGet.config", "NuGet.config"]
COPY ["MusicLibrarySuite.Application/MusicLibrarySuite.Application.csproj", "MusicLibrarySuite.Application/"]
RUN dotnet restore "MusicLibrarySuite.Application/MusicLibrarySuite.Application.csproj"
COPY "." "."

WORKDIR "/src/MusicLibrarySuite.Application"
RUN dotnet build "MusicLibrarySuite.Application.csproj" -c Release -o "/app/build" --no-restore

FROM build AS publish

RUN dotnet publish "MusicLibrarySuite.Application.csproj" -c Release -o "/app/publish" --no-restore /p:UseAppHost=false

FROM base AS final

WORKDIR "/app"
COPY --from=publish "/app/publish" "."
ENTRYPOINT ["dotnet", "MusicLibrarySuite.Application.dll"]
