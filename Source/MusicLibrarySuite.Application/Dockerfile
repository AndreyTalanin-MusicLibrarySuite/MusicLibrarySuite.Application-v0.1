FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base

EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

WORKDIR "/src"
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
